var IPKIRotateUtil = Class.create();
IPKIRotateUtil.prototype = {

    initialize: function() {
        this.ROTATION_WINDOW_PROPERTY = 'mid.ipki.rotation_trigger_threshold';
        this.DEFAULT_ROTATION_WINDOW_DAYS = 15;

        this.kmfCertUtil = undefined;
        this.certMapManager = undefined;
        this.webApiErrorUtility = undefined;
        this.userUtility = undefined;
        this.agentUtility = undefined;
        this.sessionToken = undefined;
    },

    /**
     * Checks whether a certificate is within the rotation window.
     * @param {string} validUntil - The certificate's valid_until date string.
     * @param {string} agentSysId - The sys_id of the MID server.
     * @returns {boolean} True if the certificate expires within the rotation window; false otherwise.
     */
    isInRotationWindow: function(validUntil, agentSysId) {
        var configuredDays = this._getAgentUtil().getAgentConfigValue(agentSysId, this.ROTATION_WINDOW_PROPERTY);
        var windowDays = configuredDays !== null ? parseInt(configuredDays, 10) : this.DEFAULT_ROTATION_WINDOW_DAYS;
        var windowMs = windowDays * 24 * 60 * 60 * 1000;
        var expiryMs = new GlideDateTime(validUntil).getNumericValue();
        var nowMs = new GlideDateTime().getNumericValue();

        return (expiryMs - nowMs) <= windowMs;
    },

    /**
     * Checks whether a forced rotation has been requested for the given MID within the last hour.
     * A forced rotation is indicated by a SystemCommand entry in ecc_queue with source 'IPKIRotateCert'
     * created within the last hour for the given agent.
     * @param {string} agentName - The name of the MID Server (ecc_agent.name).
     * @returns {boolean} True if a forced rotation command exists within the last hour, false otherwise.
     * TODO: placeholder until STRY63085660 is completed
     */
    isForcedRotation: function(agentName) {
        var withinLastHour = new GlideDateTime();
        // (60 * 60) * -1
        withinLastHour.addSeconds(-3600);
        var now = new GlideDateTime();

        var gr = new GlideRecord('ecc_queue');
        gr.addQuery('agent', agentName);
        gr.addQuery('topic', 'SystemCommand');
        gr.addQuery('source', 'RotateIPKI');
        gr.addQuery('sys_created_on', '>=', withinLastHour);
        gr.addQuery('sys_created_on', '<=', now);
        gr.setLimit(1);
        gr.query();
        return gr.hasNext();
    },

    /**
     * Signs a new certificate for rotation and creates a PROCESSING mapping record.
     * Extracts the user sys_id from the UID in the CSR, signs via CsrValidationEndpoint,
     * then records the new cert in sn_mid_infra_cert_map with state PROCESSING.
     * @param {string} csr - The Certificate Signing Request.
     * @param {string} agentSysId - The sys_id of the ecc_agent record.
     * @returns {{success: boolean, leafCertFormatted: string|null, detail: string, error: object|null}}
     */
    processRotationRequest: function(csr, midSysId) {
        var msg;
        try {
            // Extract the UID from the CSR subject DN and parse out the user sys_id.
            var certMapManager = this._getCertMapManager();
            var csrValidationEndpoint = new CsrValidationEndpoint(certMapManager.IPKI_ENDPOINT_NAME);
            var uid = csrValidationEndpoint.getSubjectDNComponentValue(csr, 'UID');
            if (!uid) {
                msg = 'UID not found in rotation CSR. Session Token: ' + this._getSessionToken();
                return {
                    success: false,
                    leafCertFormatted: null,
                    detail: msg,
                    error: this._getWebApiErrorUtility().createServiceError('Bad Request', 400, 'UID not found in CSR.', undefined, msg)
                };
            }

            var uidParts = uid.trim().split('-');
            if (uidParts.length !== 2) {
                msg = 'Invalid UID format in rotation CSR. Session Token: ' + this._getSessionToken();
                return {
                    success: false,
                    leafCertFormatted: null,
                    detail: msg,
                    error: this._getWebApiErrorUtility().createServiceError('Bad Request', 400, 'Invalid UID format in CSR.', undefined, msg)
                };
            }
            var userSysId = uidParts[1];

            // Validate the user exists and has the mid_server role before signing.
            var userUtil = this._getUserUtil();
            var userGr = userUtil.getById(userSysId);
            if (!userGr || !userUtil.hasRoles(userGr, ['mid_server'])) {
                msg = 'User not found or does not have the required role for UID in rotation CSR. Session Token: ' + this._getSessionToken();
                return {
                    success: false,
                    leafCertFormatted: null,
                    detail: msg,
                    error: this._getWebApiErrorUtility().createServiceError('Bad Request', 400, 'User not found or does not have the required role.', undefined, msg)
                };
            }

            // Validate the user in the CSR matches the user currently associated with this MID.
            var activeMappingGr = certMapManager.getActiveRecordByAgent(midSysId);
            if (!activeMappingGr || activeMappingGr.getValue('user') !== userSysId) {
                msg = 'CSR user does not match the user associated with this MID Server. Session Token: ' + this._getSessionToken();
                return {
                    success: false,
                    leafCertFormatted: null,
                    detail: msg,
                    error: this._getWebApiErrorUtility().createServiceError('Forbidden', 403, 'CSR user does not match the current MID Server user.', undefined, msg)
                };
            }

            // Sign the CSR.
            var leafCertFormatted;
            try {
                leafCertFormatted = csrValidationEndpoint.signCertificate(csr, true);
            } catch (e) {
                msg = 'Exception during CSR signing. Exception: ' + e.message + '. Session Token: ' + this._getSessionToken();
                gs.error(msg);
                return {
                    success: false,
                    leafCertFormatted: null,
                    detail: msg,
                    error: this._getWebApiErrorUtility().createServiceError('Internal Server Error', 500, 'Failed to sign certificate.', undefined, msg)
                };
            }

            // Look up the KMF certificate record for the newly signed leaf certificate.
            var kmfCertGr = this._getKmfCertUtil().getByPemCertificate(leafCertFormatted);
            if (!kmfCertGr) {
                throw new Error('KMF certificate not found for newly signed leaf certificate');
            }

            // Update cert map record linking the MID to the new certificate.
            certMapManager.updatedExpectedRegistration(midSysId, userSysId, kmfCertGr.getUniqueValue(),  csrValidationEndpoint, certMapManager.SOURCE.ROTATION);

            return { success: true, leafCertFormatted: leafCertFormatted, detail: 'Certificate issued', error: null };
        } catch (e) {
            msg = 'Unexpected exception during certificate rotation. Exception: ' + e.message + '. Session Token: ' + this._getSessionToken();
            gs.error(msg);
            return {
                success: false,
                leafCertFormatted: null,
                detail: msg,
                error: this._getWebApiErrorUtility().createServiceError('Internal Server Error', 500, 'Unexpected error during certificate rotation.', undefined, msg)
            };
        }
    },

    triggerRotateCertEvent: function(midName, isSuccessful, detailedMsg) {
        if (typeof midName !== 'string' || midName.trim() === '' || typeof isSuccessful !== 'boolean') {
            gs.error('Event trigger failed: Invalid arguments provided. midName (string) and isSuccessful (boolean) are required. Received: ' + JSON.stringify({ 'midName': midName || '', 'isSuccessful': isSuccessful, 'detailedMsg': detailedMsg }));
            return;
        }
        var payload = {
            'result': isSuccessful ? 'success' : 'failure',
            'mid_name': midName.trim(),
            'detailed_message': detailedMsg ? detailedMsg : ''
        };
        var json = JSON.stringify(payload);
        gs.eventQueue('sn_mid_infra.ipki_rotate_cert', null, midName.trim(), json);
    },

    buildRotationResponse: function(leafCertFormatted) {
        return {
            message: 'Rotation Successful',
            leaf_cert: leafCertFormatted
        };
    },

    // Private methods

    _getKmfCertUtil: function() {
        if (this.kmfCertUtil === undefined)
            this.kmfCertUtil = new KMFCertificateUtility();
        return this.kmfCertUtil;
    },

    _getCertMapManager: function() {
        if (this.certMapManager === undefined)
            this.certMapManager = new IPKICertMapManager();
        return this.certMapManager;
    },

    _getWebApiErrorUtility: function() {
        if (this.webApiErrorUtility === undefined)
            this.webApiErrorUtility = new WebApiErrorUtility();
        return this.webApiErrorUtility;
    },

    _getUserUtil: function() {
        if (this.userUtility === undefined)
            this.userUtility = new UserUtility();
        return this.userUtility;
    },

    _getAgentUtil: function() {
        if (this.agentUtility === undefined)
            this.agentUtility = new AgentUtility();
        return this.agentUtility;
    },

    _getSessionToken: function() {
        if (this.sessionToken === undefined) {
            this.sessionToken = gs.getSession() ? gs.getSession().getSessionToken() : '';
        }
        return this.sessionToken;
    },

    type: 'IPKIRotateUtil'
};

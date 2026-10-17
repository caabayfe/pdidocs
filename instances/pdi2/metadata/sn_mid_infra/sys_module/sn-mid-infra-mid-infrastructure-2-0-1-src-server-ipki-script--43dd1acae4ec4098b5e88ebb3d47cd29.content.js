var IPKICertMapManager = Class.create();
IPKICertMapManager.prototype = {
    /**
     * Table name for the Certificate Mapping table
     * @type {string}
     */
    CERTIFICATE_MAPPING_TABLE: 'sn_mid_infra_cert_map',
    IPKI_ENDPOINT_NAME: 'MID_SERVICE_IPKI_ENDPOINT',
    IPKI_ENDPOINT_SYS_ID: '129eaedb01c140599f9a5575f1107878',

    /**
     * State constants for certificate mapping records
     * @type {Object}
     */
    STATE: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        PROCESSING: 'processing'
    },

    SOURCE: {
        REGISTRATION: 'registration',
        ROTATION: 'rotation',
        FORCE_ROTATION: 'force_rotation'
    },

    initialize: function() {
        this.validationUtil = new ValidationUtility();
        this.sessionToken = undefined;
    },

    create: function(agentSysId, kmfCertificateSysId, userSysId, state, source, registrationKeySysId) {
        this.validationUtil.validateNonEmptyString(userSysId, 'userSysId', true);
        this._validateState(state, 'state', true);
        this.validationUtil.validateOneOf(source, [this.SOURCE.REGISTRATION, this.SOURCE.ROTATION, this.SOURCE.FORCE_ROTATION], 'source', true);

        var gr = new GlideRecord(this.CERTIFICATE_MAPPING_TABLE);
        gr.initialize();
        gr.setValue('user', userSysId);
        gr.setValue('state', state);
        gr.setValue('source_of_creation', source);

        if (agentSysId) {
            gr.setValue('agent', agentSysId);
        }
        if (kmfCertificateSysId) {
            gr.setValue('kmf_certificate', kmfCertificateSysId);
        }

        if (registrationKeySysId) {
            gr.setValue('registration_key', registrationKeySysId);
        }

        var sysId = gr.insert();
        if (!sysId) {
            throw new InvalidStateError('Failed to create certificate mapping record.');
        }

        gs.debug('Certificate mapping record: ' + sysId + ' created successfully. Session Token: ' + this._getSessionToken());
        return sysId;
    },

    /**
     * Gets the most recent active certificate mapping record for a given MID server.
     * @param {string} agentSysId - The sys_id of the MID server (ecc_agent).
     * @returns {GlideRecord|null} The active certificate mapping GlideRecord, or null if not found.
     * @throws {InvalidValueError} If agentSysId is not a valid string.
     */
    getActiveRecordByAgent: function(agentSysId) {
        this.validationUtil.validateNonEmptyString(agentSysId, 'agentSysId', true);

        var gr = new GlideRecord(this.CERTIFICATE_MAPPING_TABLE);
        gr.addQuery('agent', agentSysId);
        gr.addQuery('state', this.STATE.ACTIVE);
        gr.orderByDesc('sys_created_on');
        gr.setLimit(1);
        gr.query();

        if (gr.next())
            return gr;

        return null;
    },

    /**
     * Returns the sys_ids of every ecc_agent that has an active certificate mapping.
     * Used by callers that need to bulk-check iPKI status across many MIDs without
     * issuing a per-agent query.
     * @returns {string[]} Unique agent sys_ids in 'active' state. Empty array when none.
     */
    getActiveAgentSysIds: function() {
        var recordUtil = new RecordUtility();
        return recordUtil.getUniqueColumnValues(
            this.CERTIFICATE_MAPPING_TABLE,
            'agent',
            'state=' + this.STATE.ACTIVE
        );
    },

    /**
     * Checks if any certificate mapping record exists for a given agent.
     * @param {string} agentSysId - The sys_id of the MID server (ecc_agent).
     * @returns {boolean} True if at least one record exists for the agent, false otherwise.
     * @throws {InvalidValueError} If agentSysId is not a valid string.
     */
    hasAgentEntry: function(agentSysId) {
        this.validationUtil.validateNonEmptyString(agentSysId, 'agentSysId', true);

        var gr = new GlideRecord(this.CERTIFICATE_MAPPING_TABLE);
        gr.addQuery('agent', agentSysId);
        gr.setLimit(1);
        gr.query();

        return gr.hasNext();
    },

    /**
     * Checks if at least one MID on the instance currently has an active iPKI
     * certificate mapping. Intended as an instance-wide gate (e.g. to decide
     * whether to enable bulk iPKI migration on the dashboard).
     *
     * @returns {boolean} True if any mapping in CERTIFICATE_MAPPING_TABLE has
     *     state == STATE.ACTIVE; false otherwise.
     */
    hasActiveIpkiMid: function() {
        var gr = new GlideRecord(this.CERTIFICATE_MAPPING_TABLE);
        gr.addQuery('state', this.STATE.ACTIVE);
        gr.setLimit(1);
        gr.query();

        return gr.hasNext();
    },

    /**
     * Creates an expected registration entry for forced rotation.
     * Creates a PROCESSING record with agent and user but no certificates.
     * If a PROCESSING record already exists for the agent+user, returns its sys_id.
     * @param {string} agentSysId - The sys_id of the MID server (ecc_agent).
     * @param {string} userSysId - The sys_id of the user.
     * @returns {string} The sys_id of the expected registration record.
     * @throws {InvalidValueError} If agentSysId or userSysId is not a valid non-empty string.
     * @throws {ResourceNotFoundError} If agent or user record does not exist.
     */
    expectRegistration: function(agentSysId, userSysId) {
        this.validationUtil.validateNonEmptyString(agentSysId, 'agentSysId', true);
        this.validationUtil.validateNonEmptyString(userSysId, 'userSysId', true);

        this.validationUtil.validateRecordExists('ecc_agent', agentSysId, true);
        this.validationUtil.validateRecordExists('sys_user', userSysId, true);

        var activeRecord = this.getActiveRecordByAgent(agentSysId);
        if (activeRecord == null) {
            // Normal use case this should not happen unless someone is trying to recover agent.
            gs.warn('Attempt to set expect registration for an inactive Agent: ' + agentSysId + ' with User: ' + userSysId + '. Session Token: ' + this._getSessionToken());
        }

        var record = this._getProcessingCertificateMapping(agentSysId, userSysId);
        if (record) {
            gs.debug('Agent: ' + agentSysId + ' with User: ' + userSysId + ' is already expected to register. Existing record: ' + record.getUniqueValue() + ' found. Session Token: ' + this._getSessionToken());
            return record.getUniqueValue();
        }

        record = new GlideRecord(this.CERTIFICATE_MAPPING_TABLE);
        record.initialize();
        record.setValue('agent', agentSysId);
        record.setValue('user', userSysId);
        record.setValue('state', this.STATE.PROCESSING);
        var insertedSysId = record.insert();

        if (!insertedSysId) {
            throw new InvalidStateError('Failed to create expected registration record.');
        }

        gs.debug('Expected registration entry for Agent: ' + agentSysId + ' with User: ' + userSysId + ' created. New record: ' + record.getUniqueValue() + ' is created. Session Token: ' + this._getSessionToken());
        return record.getUniqueValue();
    },

    /**
     * Creates a new certificate mapping record.
     * @param {string|null} agentSysId - The sys_id of the MID server (ecc_agent), or null.
     * @param {string} kmfCertificateSysId - The sys_id of the KMF certificate.
     * @returns {string|null} The sys_id of the created record, or null if insert failed.
     * @throws {InvalidValueError} If any parameter is not a valid string.
     * @throws {InvalidStateError} If failed to create certificate mapping record.
     */
    assignCertificatesToProcessingMapping: function(agentSysId, userSysId, kmfCertificateSysId) {
        this.validationUtil.validateNonEmptyString(agentSysId, 'agentSysId', true);
        this.validationUtil.validateNonEmptyString(userSysId, 'userSysId', true);
        this.validationUtil.validateNonEmptyString(kmfCertificateSysId, 'kmfCertificateSysId', true);

        this.validationUtil.validateRecordExists('sys_kmf_certificate', kmfCertificateSysId, true);

        var record = this._getProcessingCertificateMapping(agentSysId, userSysId);
        if (!record)
            throw new InvalidStateError('Agent is not expected to register.');

        record.setValue('kmf_certificate', kmfCertificateSysId);
        record.update();

        return record.getUniqueValue();
    },

    /**
     * Activates a certificate mapping record.
     * @param {string} recordId - The sys_id of the certificate mapping record to activate.
     * @param {string} agentId - The sys_id of the agent.
     * @param {string} certificateId - The sys_id of the KMF certificate.
     * @throws {InvalidValueError} If any parameter is not a valid non-empty string.
     * @throws {ResourceNotFoundError} If the record is not found.
     * @throws {InvalidStateError} If the record state is not 'processing', certificate ID doesn't match, or agent ID doesn't match.
     */
    activate: function(recordId, agentId, certificateId) {
        // Validate all parameters are mandatory
        this.validationUtil.validateNonEmptyString(recordId, 'recordId', true);
        this.validationUtil.validateNonEmptyString(agentId, 'agentId', true);
        this.validationUtil.validateNonEmptyString(certificateId, 'certificateId', true);

        // Get the target record
        var gr = new GlideRecord(this.CERTIFICATE_MAPPING_TABLE);
        gr.addQuery('sys_id', recordId)
        gr.query();
        if (!gr.next())
            throw new ResourceNotFoundError('Certificate mapping record not found with sys_id: ' + recordId);

        // Validate state is 'processing'
        var currentState = gr.getValue('state');
        if (currentState !== this.STATE.PROCESSING)
            throw new InvalidStateError('Record state must be processing. Current state: ' + currentState);

        // Validate certificate ID exists in record and matches
        var recordCertificateId = gr.getValue('kmf_certificate');
        if (!recordCertificateId || recordCertificateId !== certificateId)
            throw new InvalidStateError('Certificate ID mismatch or not found in record. Expected: ' + certificateId + ', Found: ' + recordCertificateId);

        // Check agent entry in record
        var recordAgentId = gr.getValue('agent');
        if (recordAgentId) {
            // If agent exists, it must match
            if (recordAgentId !== agentId)
                throw new InvalidStateError('Agent ID mismatch. Expected: ' + agentId + ', Found: ' + recordAgentId);
        } else {
            // If agent doesn't exist, save it
            gr.setValue('agent', agentId);
        }

        // Make other active/processing entries for this agent inactive
        var otherRecordsGr = new GlideRecord(this.CERTIFICATE_MAPPING_TABLE);
        otherRecordsGr.addQuery('agent', agentId);
        otherRecordsGr.addQuery('sys_id', '!=', recordId);
        otherRecordsGr.addQuery('state', '!=', this.STATE.INACTIVE);
        otherRecordsGr.setValue('state', this.STATE.INACTIVE);
        var updatedCount = otherRecordsGr.updateMultiple();

        if (updatedCount > 0) {
            gs.debug('Deactivated ' + updatedCount + ' certificate mapping(s) for agent: ' + agentId + ' during activation of record: ' + recordId + '. Session Token: ' + this._getSessionToken());
        }

        // Change state to active and save
        gr.setValue('state', this.STATE.ACTIVE);
        gr.update();

        gs.info('Certificate mapping record: ' + recordId + ' activated successfully for agent: ' + agentId + '. Session Token: ' + this._getSessionToken());
    },

    /**
     * Makes a certificate mapping record inactive and revokes the associated KMF certificate.
     *
     * @param {string} mappingSysId - The sys_id of the certificate mapping record to deactivate.
     * @param {string} reason - The reason for making the record inactive.
     * @throws {InvalidValueError} If mappingSysId or reason is not a valid non-empty string.
     * @throws {ResourceNotFoundError} If the mapping record is not found.
     */
    makeInactive: function(mappingSysId, reason) {
        this.validationUtil.validateNonEmptyString(mappingSysId, 'mappingSysId', true);
        this.validationUtil.validateNonEmptyString(reason, 'reason', true);

        var gr = new GlideRecord(this.CERTIFICATE_MAPPING_TABLE);
        gr.addQuery('sys_id', mappingSysId)
        gr.query();
        if (!gr.next()) {
            throw new ResourceNotFoundError('Certificate mapping record not found with sys_id: ' + mappingSysId);
        }

        // Revoke the KMF certificate if present
        var kmfCertSysId = gr.getValue('kmf_certificate');
        if (kmfCertSysId) {
            try {
                var kmfCertUtil = new KMFCertificateUtility();
                var kmfCertGr = kmfCertUtil.getBySysId(kmfCertSysId);

                if (kmfCertGr && !kmfCertUtil.isRevoked(kmfCertGr)) {
                    var csrValidationEndpoint = new CsrValidationEndpoint(this.IPKI_ENDPOINT_NAME);
                    csrValidationEndpoint.revokeCertificate(kmfCertSysId, reason);
                    gs.debug('KMF certificate: ' + kmfCertSysId + ' revoked successfully. Reason: ' + reason + '. Session Token: ' + this._getSessionToken());
                }
            } catch (e) {
                gs.error('Unable to revoke KMF certificate: ' + kmfCertSysId + ' while deactivating mapping. Error: ' + e.message);
            }
        }

        gr.setValue('state', this.STATE.INACTIVE);
        gr.update();

        gs.debug('Certificate mapping: ' + mappingSysId + ' deactivated successfully. Reason: ' + reason + '. Session Token: ' + this._getSessionToken());
    },

    /**
     * Makes all non-inactive certificate mapping records for an agent inactive.
     *
     * @param {string} agentSysId - The sys_id of the MID server (ecc_agent).
     * @param {string} reason - The reason for making the records inactive.
     * @returns {number} The number of records made inactive.
     * @throws {InvalidValueError} If agentSysId or reason is not a valid non-empty string.
     */
    makeAllInactive: function(agentSysId, reason) {
        this.validationUtil.validateNonEmptyString(agentSysId, 'agentSysId', true);
        this.validationUtil.validateNonEmptyString(reason, 'reason', true);

        var gr = new GlideRecord(this.CERTIFICATE_MAPPING_TABLE);
        gr.addQuery('agent', agentSysId);
        gr.addQuery('state', '!=', this.STATE.INACTIVE);
        gr.query();

        var count = 0;
        while (gr.next()) {
            try {
                this.makeInactive(gr.getUniqueValue(), reason);
                count++;
            } catch (e) {
                gs.warn('Unable to deactivate mapping: ' + gr.getUniqueValue() + ' for agent: ' + agentSysId + '. Error: ' + e.message);
            }
        }

        if (count > 0) {
            gs.debug('Deactivated ' + count + ' certificate mapping(s) for agent: ' + agentSysId + '. Reason: ' + reason + '. Session Token: ' + this._getSessionToken());
        }

        return count;
    },

    /**
     * Gets a list of all KMF certificate sys_ids from the mapping table.
     * @param {string|null} encodedQuery - Optional encoded query to filter records. Pass null for no filtering.
     * @returns {string[]} An array of unique KMF certificate sys_ids.
     * @throws {InvalidValueError} If encodedQuery is not a valid string or null.
     */
    getReferencedKmfCertSysIds: function(encodedQuery) {
        if (encodedQuery !== null && encodedQuery !== undefined) {
            this.validationUtil.validateNonEmptyString(encodedQuery, 'encodedQuery', false);
        }

        var recordUtil = new RecordUtility();
        return recordUtil.getUniqueColumnValues(this.CERTIFICATE_MAPPING_TABLE, 'kmf_certificate', encodedQuery);
    },

    /**
     * Gets a certificate mapping record by its KMF certificate sys_id.
     * @param {string} kmfCertificateSysId - The sys_id of the KMF certificate.
     * @returns {GlideRecord|null} The certificate mapping GlideRecord, or null if not found.
     * @throws {InvalidValueError} If kmfCertificateSysId is not a valid string.
     */
    getRecordByKmfCertificate: function(kmfCertificateSysId) {
        this.validationUtil.validateNonEmptyString(kmfCertificateSysId, 'kmfCertificateSysId', true);

        var gr = new GlideRecord(this.CERTIFICATE_MAPPING_TABLE);
        gr.addQuery('kmf_certificate', kmfCertificateSysId);
        gr.setLimit(1);
        gr.query();

        if (gr.next()) {
            return gr;
        }

        return null;
    },

    /**
     * Updates the expected registration for a specific agent and user.
     * @param {string} agentSysId - The sys_id of the agent.
     * @param {string} userSysId - The sys_id of the user.
     * @param {string} kmfCertificateSysId - The sys_id of the KMF certificate.
     * @param {CsrValidationEndpoint} csrValidationEndpoint - The CSR validation endpoint to revoke previous certificate.
     * @param {string} source - The source of creation (e.g., SOURCE.REGISTRATION or SOURCE.ROTATION).
     * @param {string} [registrationKeySysId] - Optional. The sys_id of the registration key used for this request.
     * @throws {RuntimeError} If the revocation fails or if the agent is not expected to register.
     */
    updatedExpectedRegistration: function(agentSysId, userSysId, kmfCertificateSysId, csrValidationEndpoint, source, registrationKeySysId) {
        this.validationUtil.validateNonEmptyString(agentSysId, 'agentSysId', true);
        this.validationUtil.validateNonEmptyString(userSysId, 'userSysId', true);
        this.validationUtil.validateNonEmptyString(kmfCertificateSysId, 'kmfCertificateSysId', true);
        this.validationUtil.validateNonEmptyString(source, 'source', true);

        this.validationUtil.validateRecordExists('sys_kmf_certificate', kmfCertificateSysId, true);
        this.validationUtil.validateRecordExists('ecc_agent', agentSysId, true);
        this.validationUtil.validateRecordExists('sys_user', userSysId, true);

        var record = this._getProcessingCertificateMapping(agentSysId, userSysId);
        if (record) {
            // the cert will be revoked automatically once this is marked as inactive
            record.setValue('state', this.STATE.INACTIVE);
            record.update();
        }

        // Create a new mapping record for the user certificate
        this.create(agentSysId, kmfCertificateSysId, userSysId, this.STATE.PROCESSING, source, registrationKeySysId);
    },

    /**
     * Checks if a registration is expected for the given agent and user.
     * Returns true only if a PROCESSING record exists with no certificate assigned.
     * @param {string} agentSysId - The sys_id of the MID server (ecc_agent).
     * @param {string} userSysId - The sys_id of the user.
     * @returns {boolean} True if expected registration exists (PROCESSING + no certificate), false otherwise.
     * @throws {InvalidValueError} If agentSysId is not a valid non-empty string.
     * @throws {ResourceNotFoundError} If agent record does not exist.
     */
    isRegistrationExpected: function(agentSysId, userSysId) {
        this.validationUtil.validateNonEmptyString(agentSysId, 'agentSysId', true);
        this.validationUtil.validateNonEmptyString(userSysId, 'userSysId', true);
        this.validationUtil.validateRecordExists('ecc_agent', agentSysId, true);
        this.validationUtil.validateRecordExists('sys_user', userSysId, true);

        var record = this._getProcessingCertificateMapping(agentSysId, userSysId);
        if (record && !record.getValue('kmf_certificate')) {
            return true;
        }

        return false;
    },

    _getProcessingCertificateMapping: function(agentSysId, userSysId) {
        this.validationUtil.validateNonEmptyString(agentSysId, 'agentSysId', true);
        this.validationUtil.validateRecordExists('ecc_agent', agentSysId, true);

        // Check if the agent is expected to register. The kmf and user certificate is expected to be null.
        // But in case the agent tries multiple time, we will issue certificate to the agent. And only the most
        // recent record will be considered.
        var certificateMappingGr = new GlideRecord(this.CERTIFICATE_MAPPING_TABLE);
        certificateMappingGr.addQuery('state', this.STATE.PROCESSING);
        certificateMappingGr.addQuery('agent', agentSysId);
        certificateMappingGr.addQuery('user', userSysId);
        certificateMappingGr.orderByDesc('sys_created_on');
        certificateMappingGr.setLimit(1);
        certificateMappingGr.query();

        if (certificateMappingGr.next()) {
            return certificateMappingGr;
        }

        return null;
    },

    /**
     * Validates that the state value is one of the valid state constants.
     * @param {string} state - The state value to validate.
     * @param {string} paramName - The parameter name for error messages.
     * @param {boolean} required - Whether the parameter is required.
     * @throws {InvalidValueError} If the state is not a valid state constant.
     * @private
     */
    _validateState: function(state, paramName, required) {
        this.validationUtil.validateNonEmptyString(state, paramName, required);

        var validStates = [this.STATE.ACTIVE, this.STATE.INACTIVE, this.STATE.PROCESSING];
        if (validStates.indexOf(state) === -1) {
            throw new InvalidValueError('Invalid state value: ' + state + '. Must be one of: ' + validStates.join(', '));
        }
    },

    /**
     * Gets the session token for logging purposes.
     * @returns {string} The session token or empty string if not available.
     * @private
     */
    _getSessionToken: function() {
        if (this.sessionToken === undefined) {
            this.sessionToken = gs.getSession() ? gs.getSession().getSessionToken() : '';
        }
        return this.sessionToken;
    },

    getRecord: function(agentSysId, kmfCertificateSysId) {
        this.validationUtil.validateString(agentSysId, 'agentSysId', true);
        this.validationUtil.validateNonEmptyString(kmfCertificateSysId, 'kmfCertificateSysId', true);

        var gr = new GlideRecord(this.CERTIFICATE_MAPPING_TABLE);
        if (agentSysId) {
            gr.addQuery('agent', agentSysId);
        } else {
            gr.addNullQuery('agent');
        }
        gr.addQuery('kmf_certificate', kmfCertificateSysId);
        gr.setLimit(1);
        gr.query();

        if (gr.next()) {
            return gr;
        }

        return null;
    },

    /**
     * Cleans up stale certificate mapping records.
     * Deletes records that are:
     * - Not active (inactive or processing state)
     * - Created more than 24 hours ago
     * - Not updated in the past 6 hours
     *
     * @returns {number} The number of records deleted.
     */
    cleanup: function() {
        var twentyFourHoursAgo = new GlideDateTime(gs.hoursAgo(24));
        var sixHoursAgo = new GlideDateTime(gs.hoursAgo(6));

        var gr = new GlideRecord(this.CERTIFICATE_MAPPING_TABLE);
        gr.addQuery('state', '!=', this.STATE.ACTIVE);
        gr.addQuery('sys_created_on', '<', twentyFourHoursAgo);
        gr.addQuery('sys_updated_on', '<', sixHoursAgo);
        gr.query();

        var count = 0;
        while (gr.next()) {
            var recordSysId = gr.getUniqueValue();

            gs.debug('Deleting stale certificate mapping record: ' + recordSysId + ', Agent: ' + gr.getValue('agent') + ', KMF Certificate: ' + gr.getValue('kmf_certificate') + ', State: ' + gr.getValue('state') + ', Created: ' + gr.getValue('sys_created_on') + ', Updated: ' + gr.getValue('sys_updated_on') + '. Session Token: ' + this._getSessionToken());

            try {
                gr.deleteRecord();
                count++;
            } catch (e) {
                gs.warn('Failed to delete certificate mapping record: ' + recordSysId + '. Error: ' + e.message);
            }
        }

        if (count > 0) {
            gs.info('Cleanup completed. Deleted ' + count + ' stale certificate mapping record(s). Session Token: ' + this._getSessionToken());
        } else {
            gs.debug('Cleanup completed. No stale certificate mapping records found. Session Token: ' + this._getSessionToken());
        }

        return count;
    },

    type: 'IPKICertMapManager'
};

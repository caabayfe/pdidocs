var MidIPKIApiUtil = Class.create()
MidIPKIApiUtil.prototype = {
  
    MID_IPKI_POLICY_SYS_ID: 'c691ccd947440710575dd903e16d43d0',
  
    initialize: function (requestData) {
        if (!requestData) {
            throw new Error('Invalid argument: requestData must be provided to the MidIPKIApiUtil constructor.');
        }
        this.requestData = requestData;
        this.sessionToken = undefined;
        this.registrationKeyManager = undefined;
        this.webApiErrorUtility = undefined;
        this.userUtility = undefined;
        this.agentUtility = undefined;
        this.requestUID = undefined;
    },

    getRequestStringForLog: function() {
        var request = {}
        request.sessionToken = this._getSessionToken();
        if (this.requestData.registration_key) {
            var rk = this.requestData.registration_key
            var maskedKey = this._getRegistrationKeyManager().maskRegistrationKey(rk)
            request.registration_key = maskedKey
        }
        if (this.requestData.mid_sys_id) {
            request.midSysId = this.requestData.mid_sys_id
        }
        if (this.requestUID !== undefined) {
            request.requestUID = this.requestUID
        }
        if (this.requestData.csr) {
            request.csr_length = this.requestData.csr.length
        }
        return JSON.stringify(request)
    },

    /**
     * Builds the certificate response object.
     * @param {string} leafCertFormatted - The formatted leaf certificate
     * @returns {Object} Response object with leaf certificate
     */
    buildCertificateResponse: function(leafCertFormatted) {
        return {
            message: 'Registration Successful',
            leaf_cert: leafCertFormatted
        };
    },

    validateAgentInRequest: function() {
        var midSysId = this._getMidIdFromRequest();

        // If mid_sys_id is not provided, skip validation. This is not an error.
        if (!midSysId) {
            gs.debug('CSR signing: No MID Server sys_id provided in request. Skipping agent validation. Session Token: ' + this._getSessionToken());
            return {
                valid: true,
                error: null
            };
        }

        try {
            var agentGr = this._getAgentUtil().getAgentRecord(midSysId);
            if (agentGr && agentGr.getValue('name') === this._getMidNameFromRequest()) {
                return {
                    valid: true,
                    error: null
                };
            }

            // Agent not found for the given sys_id, which is a client error.
            var notFoundLog = 'Agent not found for mid_sys_id: ' + midSysId + ' or does not match mid_name: ' + this._getMidNameFromRequest();
            return {
                valid: false,
                detail: notFoundLog,
                error: this._getWebApiErrorUtility().createServiceError(
                    'Bad Request',
                    400,
                    'No agent found for the provided mid_sys_id or mid_name does not match.',
                    null,
                    notFoundLog
                )
            };
        } catch (e) {
            // An unexpected exception occurred, which is a server error.
            var exceptionLog = 'Exception during agent validation for mid_sys_id: ' + midSysId + '. Exception: ' + e.message + '. Session Token: ' + this._getSessionToken() + ' Error Stack: ' + e.stack;
            return {
                valid: false,
                detail: exceptionLog,
                error: this._getWebApiErrorUtility().createServiceError(
                    'Internal Server Error',
                    500,
                    'An unexpected error occurred during agent validation.',
                    null,
                    exceptionLog
                )
            };
        }
    },

    /**
     * Processes a certificate signing request (CSR) by validating the user and CSR,
     * signing the certificate, and returning the signed certificate.
     * @param {string} [expectedUserSysId] - Optional. The expected user sys_id from registration key's assigned_to field. If provided, validates that the user in the CSR matches this user.
     * @param {string} [registrationKeySysId] - Optional. The sys_id of the registration key used for this request. Required for registration flow.
     * @returns {{success: boolean, leafCertFormatted: string|null, error: object|null}} 
     *          An object indicating success, and containing the formatted leaf certificate or an error object.
     */
    processSignRequest: function(expectedUserSysId, registrationKeySysId) {
        try {
            var ipkiCertMapManager = new IPKICertMapManager();
            var csrValidationEndpoint = new CsrValidationEndpoint(ipkiCertMapManager.IPKI_ENDPOINT_NAME);

            this.requestUID = csrValidationEndpoint.getSubjectDNComponentValue(this.requestData.csr, 'UID');

            if (!this.requestUID) {
                var errorLog = 'UID not found in CSR. Session Token: ' + this._getSessionToken();
                return {
                    success: false,
                    detail: errorLog,
                    error: this._getWebApiErrorUtility().createServiceError('Invalid csr', 400, 'UID not found in CSR', null, errorLog)
                 };
            }

            gs.debug('CSR signing: UID: ' + this.requestUID + ' extracted from CSR successfully. Session Token: ' + this._getSessionToken());

            var userValidation = this._validateUserFromUID();
            if (!userValidation.valid) {
                var errorLog = userValidation.error + '. Session Token: ' + this._getSessionToken();
                return {
                    success: false,
                    detail: errorLog,
                    error: this._getWebApiErrorUtility().createServiceError('Invalid csr', 400, userValidation.error, null, errorLog)
                };
            }

            this.createUserPolicyMapping(userValidation.userSysId);

            var leafCertFormatted;
            try {
                // Validate user in CSR matches expected user from registration key (if provided)
                if (expectedUserSysId && userValidation.userSysId !== expectedUserSysId) {
                    var errorLog = 'User in CSR does not match assigned user in registration key. User from CSR: ' + 
                        userValidation.userSysId + ', Expected user: ' + expectedUserSysId + 
                        '. Session Token: ' + this._getSessionToken();
                    gs.warn(errorLog);  // Log for security monitoring
                    throw new Error(errorLog);
                }

                leafCertFormatted = csrValidationEndpoint.signCertificate(this.requestData.csr, true);

            } catch (e) {
                var errorLog = 'Exception during certificate signing. UID: ' + this.requestUID + '. Exception: ' + e.message + '. Session Token: ' + this._getSessionToken() + ' Error Stack: ' + e.stack;
                return {
                    success: false,
                    detail: errorLog,
                    error: this._getWebApiErrorUtility().createServiceError('Internal Server Error', 500, 'Failed to sign certificate', null, errorLog)
                };
            }

            var kmfCertificateGr = this._getKmfCertUtil().getByPemCertificate(leafCertFormatted);
            if (!kmfCertificateGr)
                throw new Error('KMF certificate not found for leaf certificate');

            var midID = this._getMidIdFromRequest();

            // Determine source: if no registration key, it's a rotation; otherwise it's registration
            var source = registrationKeySysId ? ipkiCertMapManager.SOURCE.REGISTRATION : ipkiCertMapManager.SOURCE.ROTATION;

            if(midID == null) {
                // Create a new mapping record for the user certificate
                ipkiCertMapManager.create(midID, kmfCertificateGr.getUniqueValue(), userValidation.userSysId, ipkiCertMapManager.STATE.PROCESSING, source, registrationKeySysId);
            } else {
                ipkiCertMapManager.updatedExpectedRegistration(midID, userValidation.userSysId, kmfCertificateGr.getUniqueValue(), csrValidationEndpoint, source, registrationKeySysId);
            }

            return { 
                success: true, 
                leafCertFormatted: leafCertFormatted,
                userSysId: userValidation.userSysId
            };
        } catch (e) {
            var errorLog = 'Exception during processing CSR. Exception: ' + e.message + '. Session Token: ' + this._getSessionToken() + ' Error Stack: ' + e.stack;
            return {
                success: false,
                detail: errorLog,
                error: this._getWebApiErrorUtility().createServiceError('Error processing CSR', 500, 'Unexpected error while processing CSR', null, errorLog)
            };
        }
    },

    /**
     * Creates a user-policy mapping between the given user and the MID IPKI auth policy.
     * Idempotent — succeeds if the mapping already exists.
     * @param {string} userSysId - The sys_id of the user to map to the MID IPKI policy.
     * @throws {Error} If the mapping could not be created.
     */
    createUserPolicyMapping: function(userSysId) {
        var policyMappingResponse = new sn_ipki_auth.IPKIAuthPolicyAPI().createUserPolicyMapping(userSysId, this.MID_IPKI_POLICY_SYS_ID);
        if (!policyMappingResponse.isSuccessful()) {
            var errorMessage = 'Failed to create IPKI user policy mapping for user: ' + userSysId + '. Error: ' + policyMappingResponse.getErrorMessage();
            gs.error(errorMessage);
            throw new Error(errorMessage);
        }
        gs.info('IPKI user policy mapping created. Mapping sys_id: ' + policyMappingResponse.getResponse() + '. User: ' + userSysId);
    },

    // Private methods
    _validateAndExtractUserSysId: function() {
        if (gs.nil(this.requestUID)) {
            return {
                valid: false,
                userSysId: null,
                error: 'UID value is null or empty'
            };
        }

        var uidParts = this.requestUID.trim().split('-');
        if (uidParts.length !== 2) {
            return {
                valid: false,
                userSysId: null,
                error: 'Invalid UID format. Expected format: <unique_identifier>-<user_sys_id>.'
            };
        }

        return {
            valid: true,
            userSysId: uidParts[1],
            error: null
        };
    },

    _validateUserFromUID: function() {
        var uidResult = this._validateAndExtractUserSysId();
        if (!uidResult.valid) {
            return {
                valid: false,
                userGr: null,
                userSysId: null,
                error: uidResult.error
            };
        }

        var userUtil = this._getUserUtil();

        var userGr = userUtil.getById(uidResult.userSysId);
        if (!userGr) {
            return {
                valid: false,
                userGr: null,
                userSysId: uidResult.userSysId,
                error: 'User not found or does not have the required role.'
            };
        }

        // Check user has required role
        var userRoles = userUtil.getUserRolesWithSubroles(uidResult.userSysId);

        if (!userRoles.has('mid_server')) {
            return {
                valid: false,
                userGr: userGr,
                userSysId: uidResult.userSysId,
                error: 'User not found or does not have the required role.'
            };
        }

        return {
            valid: true,
            userGr: userGr,
            userSysId: uidResult.userSysId,
            error: null
        };
    },

    _getRegistrationKeyManager: function() {
        if (this.registrationKeyManager === undefined)
            this.registrationKeyManager = new RegistrationKeyManager();
        return this.registrationKeyManager;
    },

    _getWebApiErrorUtility: function() {
        if (this.webApiErrorUtility === undefined)
            this.webApiErrorUtility = new WebApiErrorUtility();
        return this.webApiErrorUtility;
    },

    _getKmfCertUtil: function() {
        if (this.kmfCertUtil === undefined)
            this.kmfCertUtil = new KMFCertificateUtility();
        return this.kmfCertUtil;
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

    _getMidIdFromRequest: function() {
        if (!this.requestData || !this.requestData.mid_sys_id || this.requestData.mid_sys_id.trim() === '') {
            return null;
        }
        return this.requestData.mid_sys_id.trim();
    },

    _getMidNameFromRequest: function() {
        if (!this.requestData || !this.requestData.mid_name || this.requestData.mid_name.trim() === '') {
            return null;
        }
        return this.requestData.mid_name.trim();
    },

    triggerSignCsrEvent: function(midName, isSuccessful, detailedMsg) {
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
        gs.eventQueue('sn_mid_infra.sign_csr', null, midName.trim(), json);
    },

    _getSessionToken: function() {
        if (this.sessionToken === undefined) {
            this.sessionToken = gs.getSession() ? gs.getSession().getSessionToken() : '';
        }
        return this.sessionToken;
    },

    type: 'MidIPKIApiUtil',
}

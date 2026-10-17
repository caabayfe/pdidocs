var PwdResetStageHandler = Class.create();
PwdResetStageHandler.prototype = {
    initialize: function() {},

    /* public methods begin { */
    /*
     * @param {Gliderecord} requestGr
     * @param {boolean} isEmailURLEnabled
     * @param {string} userId
     * @param {string} token
     * @returns {boolean} isSecure
     * 
     */
    isResetSecure: function(requestGr, isEmailURLEnabled, userId, token) {
        var isSecure = new SNC.PwdSecurityManager().validateSecureTokenFromHttpRequest();
        //the request may come from link
        if (isEmailURLEnabled) {
            var requestId = requestGr.getUniqueValue();
            //if reset_url_verified exists then this is a retry scenario in case of password policy failure
            var resetURLVerifiedRequestID = gs.getSession().getProperty('reset_url_verified');
            if (!gs.nil(resetURLVerifiedRequestID) && resetURLVerifiedRequestID == requestId)
                return true;
            //in this case ignore the CSRF token and verify the token from the URL 
            isSecure = false;
            if (!gs.nil(userId) && !gs.nil(token) && !gs.nil(requestId)) {
                var userName = GlideUser.getUserByID(userId).getName();
                if (!gs.nil(userName) && userName != "guest") {
                    var isTokenValid = SNC.PasswordResetUtil.validateUniqueUserToken(userId, token, false);
                    if (isTokenValid == false)
                        SNC.PasswordResetUtil.invalidateTokenForUser(userId, token);
                    else if (requestGr.getValue("user") === userId) {
                        isSecure = true;
                        if (requestGr.getValue("status") === PwdConstants.REQUEST_STATE_RESET_URL_TOKEN_VALIDATION_PENDING.toString()) {
                            var trackingManager = new SNC.PwdTrackingManager();
                            trackingManager.updateRequestStatus(requestId, PwdConstants.REQUEST_STATE_VERIFIED);
                            trackingManager.createActivity(PwdConstants.TYPE_INFO, PwdConstants.STAGE_RESET, "User verified successfully", requestId);
                        }
                    }
                }
            }
        }
        if (isSecure) {
            gs.getSession().putProperty('reset_url_verified', requestId);
        }
        return isSecure;
    },

    /*
     * @param {string} processId
     * @returns {JSONObject}
     * {
     * 		rulesWithRegex:,
     * 		rulesWithoutRegex:
     * }
     */
    getPasswordPolicyRuleHints: function(processId) {
        var rule = SNC.PasswordPolicyEvaluator.getPasswordRuleHints(new SNC.PwdCredentialStoreManager().getPasswordPolicyId(processId));
        var parsedResult = JSON.parse(rule);
        if (!parsedResult)
            return rule;
        var rulesWithRegex = [];
        var rulesWithoutRegex = [];
        for (var i = 0; i != parsedResult.length; i++) {
            if (parsedResult[i].regex != "") {
                rulesWithRegex.push(parsedResult[i]);
            } else {
                rulesWithoutRegex.push(parsedResult[i]);
            }
        }

        var pwdResetUtil = new PasswordResetUtil();
        // If history policy is enabled for 'Local ServiceNow Instance' cred store then remove the existing history policy rule coming from the above passwordPolicyEvaluator.getPasswordRuleHints() API as this may not correct
        if (pwdResetUtil.isHistoryPolicyEnabledForLocalCredStore(PwdConstants.LOCAL_CRED_STORE_SYS_ID))
            rulesWithoutRegex.splice(-1);
        var pwdCredStoreMgr = new SNC.PwdCredentialStoreManager();
        var credStoreParams = pwdCredStoreMgr.getCredentialStoreParamsByProcessId(processId);
        var historyLimit = credStoreParams.get("password_history_limit");

        if (pwdResetUtil.isHistoryPolicyEnabledForLocalCredStore(pwdCredStoreMgr.getCredentialStoreIdByProcessId(processId))) {
            rulesWithoutRegex.push({
                "regex": "",
                "hint": gs.getMessage("Previous {0} passwords must not be used", historyLimit),
                "must": false
            });
        }
        return JSON.stringify({
            'rulesWithRegex': rulesWithRegex,
            'rulesWithoutRegex': rulesWithoutRegex
        });
    },

    /*
     * @param {string} processId
     * @returns {string}
     * Fetches the password rule hint description
     */
    getPasswordRuleDesc: function(processId) {
        if (gs.nil(processId)) return "";
        return new SNC.PwdCredentialStoreManager().getPasswordRuleDesc(processId);
    },

    /*
     * @param {string} policyId
     * @returns {JSONObject}
     * {
     * 		strengthCalRegexList:,
     * 		characterLimit:,
     *  	characterCount:,
     *  	similarAscendingDescendingCount:,
     *  	splCharLimit:
     * }
     */
    getPasswordStrengthScriptParams: function(policyId) {
        return JSON.parse(SNC.PasswordPolicyEvaluator.getPasswordStrengthScriptParams(policyId));
    },

    /*
     * @param {Gliderecord} processGr
     * @returns {string} loginURL
     * 
     */
    getDoneButtonRedirectURL: function(processGr) {
        var storedLoginURL = gs.getSession().getProperty('login_locate_sso.login_url');
        var loginURL = gs.nil(storedLoginURL) ? '/navpage.do' : storedLoginURL;
        if (!gs.nil(processGr.redirect_url))
            loginURL = processGr.redirect_url;

        // pwd_redirect_url is already validated by PwdResetHelper.getAllowedRedirectUrl
        // at ingestion (passwordreset.do / $pwd_reset.do), so an allowed request-supplied
        // redirect takes precedence over the process's own configured redirect_url here.
        var sessionRedirectUrl = gs.getSession().getProperty('pwd_redirect_url');
        if (!gs.nil(sessionRedirectUrl))
            loginURL = sessionRedirectUrl;

        return loginURL;
    },

    /*
     * @param {string} requestId
     * @param {string} processId
     * @param {boolean} workflowStatus
     * @returns {object} PasswordResetResponseUtility
     * 
     */
    runPostProcessorScript: function(requestId, processId, workflowStatus) {
        var pwdResetResponseUtility = new global.PasswordResetResponseUtility();
        var pwdResetRespConst = new PasswordResetResponseConstants();

        var LOG_ID = "[PwdResetStageHandler:runPostProcessorScript] ";
        var trackingMgr = new SNC.PwdTrackingManager();

        var gr = new GlideRecord('pwd_process');
        if (!gr.get(processId)) {
            var errorMsg = LOG_ID + "Cannot load the process: " + processId;
            trackingMgr.createActivity(PwdConstants.TYPE_WARNING, PwdConstants.STAGE_RESET, errorMsg, requestId);
            pwdResetResponseUtility.setError(pwdResetRespConst.PROCESS_LOAD_ERROR, [LOG_ID, processId]);
            return pwdResetResponseUtility;
        }

        if (workflowStatus && ((gr.auto_gen_password || gr.send_email) && gr.sys_id == PwdConstants.DEFAULT_SELF_SERVICE_PROCESS_ID)) {
            gs.getSession().putProperty('pwd_reset_done_redirect', gs.getSession().getProperty('pwd_redirect_url'));
        }

        if (workflowStatus) {
            gs.getSession().clearProperty('pwd_redirect_url');
        }

        if (!gs.nil(gr.post_processor)) {
            var postProcessorId = gr.post_processor;
            var postProcessorName = gr.post_processor.name;

            try {
                // Invoke the post process script include selected on the process

                // published interface for the password_reset.extension.post_rest_script extensions (see pwd_extension_type) is:
                //
                // @param params.resetRequestId The sys-id of the current password-reset request (table: pwd_reset_request)
                // @param params.wfSuccess      A flag indicating if workflow completed sucessfully. True if (and only if) sucessful.
                // @return no return value

                var params = new SNC.PwdExtensionScriptParameter();
                params.resetRequestId = requestId;
                params.wfSuccess = workflowStatus == "true" ? true : false;
                var postResetExtension = new SNC.PwdExtensionScript(postProcessorId);

                var infoMsg = LOG_ID + "Starting post-processor script: " + postProcessorName;
                trackingMgr.createActivity(PwdConstants.TYPE_INFO, PwdConstants.STAGE_RESET, infoMsg, requestId);

                postResetExtension.process(params);
            } catch (error) {
                var exceptionMsg = LOG_ID + "Error while executing post-processor script: " + postProcessorName + ". Error:" + error;
                trackingMgr.createActivity(PwdConstants.TYPE_INFO, PwdConstants.STAGE_RESET, exceptionMsg, requestId);
                pwdResetResponseUtility.setError(pwdResetRespConst.POST_PROCESSOR_EXECUTION_ERROR, [LOG_ID, postProcessorName, error]);
                return pwdResetResponseUtility;
            }
            var successMsg = LOG_ID + "Completed post-processor script: " + postProcessorName;
            trackingMgr.createActivity(PwdConstants.TYPE_INFO, PwdConstants.STAGE_RESET, successMsg, requestId);
            pwdResetResponseUtility.setSuccess(pwdResetRespConst.POST_PROCESSOR_SCRIPT_SUCCESS, [LOG_ID, postProcessorName]);
        }
        return pwdResetResponseUtility;
    },

    /*
     * @param {string} requestId
     * @returns {boolean}
     */
    isRequestVerified: function(requestId) {
        return new SNC.PwdTrackingManager().requestVerified(requestId);
    },

    /*
     * @param {string} requestId
     * @param {string} userId
     * @returns 
     * "failure" in case of error
     * workflow contextId in case of workflow used
     * Otherwise IH subflow JSON output
     */
    startUnlockFlow: function(requestId, userId) {
        var LOG_ID = "[PwdResetStageHandler:startUnlockFlow] ";
        var pwdUserUnlockUtil = new PwdUserUnlockUtil();
        var result = pwdUserUnlockUtil.startUnlcokWorkflow(requestId, userId);

        if (result == pwdUserUnlockUtil.STATUS_UNVERIFIED) {
            errorMsg = LOG_ID + "Could not verify request: " + requestId;
            pwdUserUnlockUtil.trackingMgr.createActivity(PwdConstants.TYPE_WARNING, PwdConstants.STAGE_RESET, errorMsg, requestId);
            return pwdUserUnlockUtil.STATUS_FAILURE;
        } else if (result == pwdUserUnlockUtil.STATUS_FAILURE) {
            errorMsg = LOG_ID + "Failed to start the workflow to unlock user's account";
            pwdUserUnlockUtil.trackingMgr.createActivity(PwdConstants.TYPE_ERROR, PwdConstants.STAGE_RESET, errorMsg, requestId);
            return pwdUserUnlockUtil.STATUS_FAILURE;
        } else {
            return result;
        }
    },

    /*
     * @param {string} wfContextId
     * @returns {JSON} data
     */
    getWFData: function(wfContextId) {
        var data = {};
        data.context = this._getWFContext(wfContextId);
        data.history = this._getWFHistory(wfContextId);
        return data;
    },

    /*
     * @param {string} requestId
     * @returns {boolean} 
     */
    isMaxAttemptsReached: function(requestId) {
        var maxAttemptsReached = PwdADMaxAttemptsHelper.checkMaxAttemptsReached(requestId);
        if (maxAttemptsReached) {
            var count = PwdADMaxAttemptsHelper.getMaxResetAttemptsAllowed(requestId);
            var trackingMgr = new SNC.PwdTrackingManager();
            trackingMgr.updateADRequestMaxRetry(requestId, count);
            gs.getSession().clearProperty('pwd_reset_counter');
            return true;
        }
        return false;
    },

    /*
     * @param {string} password
     * @returns {JSON} 
     */
    getPasswordWithPhonetics: function(password) {
        if (gs.nil(password)) {
            password = gs.getSession().getProperty('temp_password');
            gs.getSession().clearProperty("temp_password");
        }
        var result = {
            'password': password
        };
        result.phoneticPassword = this._getPhoneticPassword(password);
        return result;
    },

    /*
     * @param {string} ctxId
     * @returns {JSON}
     * {
     *	result:
     *	state:
     * } 
     */
    getUnlockAccountWFInfo: function(ctxId) {
        return PWDWorkflowHelper.getWorkflowData(ctxId);
    },

    /* public methods end } */

    /* private methods begin { */
    _getWFContext: function(sysId) {
        var gr = new GlideRecord('wf_context');
        if (gr.get(sysId)) {
            return {
                'workflow': gr.getValue('workflow'),
                'workflow_version': gr.getValue('workflow_version'),
                'parent': gr.getValue('parent'),
                'table': gr.getValue('table'),
                'id': gr.getValue('id'),
                'state': gr.getValue('state'),
                'started': gr.getValue('started'),
                'ended': gr.getValue('ended'),
                'due': gr.getValue('due'),
                'stage': gr.getValue('stage'),
                'result': gr.getValue('result'),
                'scratchpad': gr.getValue('scratchpad'),
                'active': gr.getValue('active'),
                'active_count': gr.getValue('active_count'),
                'active_index': gr.getValue('active_index'),
                'after_business_rules': gr.getValue('after_business_rules'),
                'started_by': gr.getValue('started_by'),
                'auto_start': gr.getValue('auto_start'),
                'sys_domain': gr.getValue('sys_domain'),
                'schedule': gr.getValue('schedule'),
                'timezone': gr.getValue('timezone'),
                'sys_id': gr.getValue('sys_id'),
                'sys_updated_by': gr.getValue('sys_updated_by'),
                'sys_updated_on': gr.getValue('sys_updated_on'),
                'sys_created_by': gr.getValue('sys_created_by'),
                'sys_created_on': gr.getValue('sys_created_on'),
                'sys_mod_count': gr.getValue('sys_mod_count')
            };
        }
        return null;
    },

    _getWFHistory: function(ctxId) {
        var wfHistory = [];
        var gr = new GlideRecord('wf_history');
        gr.addQuery('context', ctxId);
        gr.orderBy('activity_index');
        gr.addJoinQuery('wf_activity', 'activity', 'sys_id');
        gr.query();

        while (gr.next()) {
            wfHistory.push({
                'activity': this._getWFActivity(gr.getValue('activity')),
                'workflow_version': gr.getValue('workflow_version'),
                'context': gr.getValue('context'),
                'parent': gr.getValue('parent'),
                'is_parent': gr.getValue('is_parent'),
                'started': gr.getValue('started'),
                'ended': gr.getValue('ended'),
                'due': gr.getValue('due'),
                'state': gr.getValue('state'),
                'activity_result': gr.getValue('result'),
                'fault_description': gr.getValue('fault_description'),
                'output': gr.getValue('output'),
                'activity_index': gr.getValue('activity_index'),
                'rolled_back_by': gr.getValue('rolled_back_by'),
                'sys_domain': gr.getValue('sys_domain'),
                'sys_updated_by': gr.getValue('sys_updated_by'),
                'sys_updated_on': gr.getValue('sys_updated_on'),
                'sys_created_by': gr.getValue('sys_created_by'),
                'sys_created_on': gr.getValue('sys_created_on'),
                'sys_mod_count': gr.getValue('sys_mod_count'),
                'sys_id': gr.getValue('sys_id')
            });
        }
        return wfHistory;
    },

    /* eslint-disable no-unused-vars */
    _getWFActivity: function(activityId) {
        var gr = new GlideRecord('wf_activity');
        if (gr.get(activityId)) {
            return {
                'name': gr.getValue('name'),
                'state': gr.getValue('state'),
                'activity_definition': gr.getValue('activity_definition'),
                'workflow_version': gr.getValue('workflow_version'),
                'stage': gr.getValue('stage'),
                'x': gr.getValue('x'),
                'y': gr.getValue('y'),
                'height': gr.getValue('height'),
                'width': gr.getValue('width'),
                'parent': gr.getValue('parent'),
                'vars': gr.getValue('vars'),
                'timeout': gr.getValue('timeout'),
                'sys_domain': gr.getValue('sys_domain'),
                'sys_id': gr.getValue('sys_id'),
                'sys_updated_by': gr.getValue('sys_updated_by'),
                'sys_updated_on': gr.getValue('sys_updated_on'),
                'sys_created_by': gr.getValue('sys_created_by'),
                'sys_created_on': gr.getValue('sys_created_on'),
                'sys_mod_count': gr.getValue('sys_mod_count')
            };
        }
        return null;
    },

    _getPhoneticPassword: function(password) {
        password = password + "";
        var result = {};
        for (var i = 0; i < password.length; i++) {
            result[password.charAt(i)] = this._getPhonetic(password.charAt(i));
        }
        return result;
    },

    _getPhonetic: function(chr) {
        var CODE = "pwd_reset";
        switch (true) {
            case (!(('A' > chr) || (chr > 'Z'))):
                return sn_i18n.Message.getMessage(CODE, "Capital letter '{alphabet}', as in {alphabetPhonetic? phonetic reading of the given alphabet}", {
                    alphabet: chr,
                    alphabetPhonetic: PwdConstants.PHONETIC[chr]
                });
            case (!(('a' > chr) || (chr > 'z'))):
                return sn_i18n.Message.getMessage(CODE, "Small letter '{alphabet}', as in {alphabetPhonetic? phonetic reading of the given alphabet}", {
                    alphabet: chr,
                    alphabetPhonetic: PwdConstants.PHONETIC[chr.toUpperCase()]
                });
            case (!(('0' > chr) || (chr > '9'))):
                return sn_i18n.Message.getMessage(CODE, "The number {numberPhonetic? phonetic reading of the given number}", {
                    numberPhonetic: PwdConstants.PHONETIC[chr]
                });
            case (chr in PwdConstants.PHONETIC):
                return sn_i18n.Message.getMessage(CODE, "The character {specialCharacterPhonetic? phonetic reading of the given specialCharacter} ({specialCharacter})", {
                    specialCharacterPhonetic: PwdConstants.PHONETIC[chr],
                    specialCharacter: chr
                });
            default:
                return sn_i18n.Message.getMessage(CODE, "The character '{specialCharacter}'", {
                    specialCharacter: chr
                });
        }
    },
    /* private methods end } */
    type: 'PwdResetStageHandler'
};

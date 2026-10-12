var PWDChangePasswordBL = Class.create();
PWDChangePasswordBL.prototype = {
    credentialMgr: new SNC.PwdCredentialStoreManager(),
    passwordPolicyEvaluator: SNC.PasswordPolicyEvaluator,
    CHANGE_PASSWORD_MASTER_WORKFLOW: "Pwd Change - Master",
    STAGE_CHANGE_PWD: "Change password",

    REQUEST_TYPE: 3, // request type for Change Password
    REQUEST_ACTION_TYPE: 4, // request action type for Change Password

    STATUS_ERROR: 'error',
    STATUS_BLOCKED: 'block',
    STATUS_SUCCESS: 'success',
    STATUS_PENDING: 'pending',
    STATUS_FAILURE: 'failure',
    CHANGE_PASSWORD_ACTION: '2',

    initialize: function() {},

    getProcessesForUser: function(userId) {
        var processMgr = new SNC.PwdProcessManager();
        var processIds = processMgr.getProcessIdsByUserId(userId);
        var processes = [];
        var processId;
        var process;
        var name;
        var pwdRule;
        var strengthRule;
        var pwdPolicyRuleHint;
        var enablePasswordPolicy;
        var hints;
        var pwdResetUtil = new PasswordResetUtil();

        //check if history policy is enabled for the 'Local ServiceNow Instance' cred store 
        if (processIds.size() > 0)
            var isHistoryPolicyEnabledForLocalCredStore = pwdResetUtil.isHistoryPolicyEnabledForLocalCredStore(PwdConstants.LOCAL_CRED_STORE_SYS_ID);

        for (var i = 0; i < processIds.size(); i++) {
            hints = "";
            pwdPolicyRuleHint = "";
            processId = processIds.get(i);
            process = new SNC.PwdProcess(processId);

            // Skip the process if it does not support change password
            if (!process.isChangePwd())
                continue;

            name = process.getLabel();

            // prefix with domain name if plugin is active
            if (GlidePluginManager.isRegistered("com.glide.domain.msp_extensions.installer"))
                name = process.getDomainDisplayName() + ": " + name;

            enablePasswordPolicy = this.credentialMgr.getEnablePasswordPolicy(processId);
            pwdRule = this.credentialMgr.getPasswordRule(processId);
            if (enablePasswordPolicy) {
                var credStoreId = new SNC.PwdProcess(processId).getCredentialStoreId();
                var credStore = new SNC.PwdCredentialStore(credStoreId);

                var credStoreParams = credStore.getCredentialStoreParams();
                var historyLimit = credStoreParams.get("password_history_limit");

                var policyId = this.credentialMgr.getPasswordPolicyId(processId);
                strengthRule = this.passwordPolicyEvaluator.getPasswordStrengthScript(policyId);
                pwdPolicyRuleHint = JSON.parse(this.passwordPolicyEvaluator.getPasswordRuleHints(policyId));

                // If history policy is enabled for 'Local ServiceNow Instance' cred store then remove the existing history policy rule coming from the above passwordPolicyEvaluator.getPasswordRuleHints() API as this may not correct
                if (isHistoryPolicyEnabledForLocalCredStore) {
                    pwdPolicyRuleHint.splice(-1);
                }

                if (pwdResetUtil.isHistoryPolicyEnabledForLocalCredStore(credStoreId)) {
                    pwdPolicyRuleHint.push({
                        "regex": "",
                        "hint": gs.getMessage("Previous {0} passwords must not be used", historyLimit),
                        "must": false
                    });
                }
                pwdPolicyRuleHint = JSON.stringify(pwdPolicyRuleHint);
            } else {
                strengthRule = this.credentialMgr.getStrengthRule(processId);
                hints = this.credentialMgr.getPasswordRuleDesc(processId);
            }

            processes.push({
                name: name,
                procId: processId,
                pwdRuleHint: hints,
                pwdRule: pwdRule.replace("isPasswordValid", "isPasswordValid_" + processId),
                enablePasswordStrength: this.credentialMgr.getEnablePasswordStrength(processId),
                strengthRule: strengthRule.replace("calculatePasswordStrength", "calculatePasswordStrength_" + processId),
                enablePasswordPolicy: enablePasswordPolicy,
                pwdPolicyRuleHint: pwdPolicyRuleHint
            });
        }
        return processes;
    },

    evaluatePasswordRule: function(processId, encryptedNewPassword, requestId) {
        return this.credentialMgr.evaluatePasswordRuleAdvance(processId, encryptedNewPassword, requestId);
    },

    changePassword: function(userId, processId, newPassword, oldPassword, source) {
        var process = new SNC.PwdProcess(processId);
        var result = {
            status: this.STATUS_SUCCESS,
            ctxId: '',
            requestId: '',
            errorMessage: '',
        };

        if (gs.nil(userId) || gs.nil(process) || !process.isActive() || !process.isChangePwd() || !this._isUserAuthorized(userId)) {
            result.status = this.STATUS_FAILURE;
            result.errorMessage = gs.getMessage("Invalid request");
            return result;
        }

        var pwdFlowHelper = new PwdFlowHelper();

        var trackingMgr = new SNC.PwdTrackingManager();
        var requestId = trackingMgr.createRequest(processId, userId, gs.getSessionID(), this.REQUEST_TYPE);
        trackingMgr.updateRequestActionType(requestId, this.REQUEST_ACTION_TYPE);
        if (!gs.nil(source))
            trackingMgr.updateRequestSource(requestId, source);
        result.requestId = requestId;

        // if locked quit 
        if (trackingMgr.isRequestLocked(userId, processId)) {
            var blockedMsg = "Cannot create request (process_id = " + processId + ", user_sys_id = " + userId + ") because the user is blocked.";
            trackingMgr.createActivity(PwdConstants.TYPE_ERROR, PwdConstants.STAGE_CHANGE_PWD, blockedMsg, requestId);
            // Leave request in progress state with retryCount of 0 - This way 
            // the next try with reuse this request and not lose one retry count.
            result.status = this.STATUS_BLOCKED;

            return result;
        }

        trackingMgr.createActivity(PwdConstants.TYPE_INFO, PwdConstants.STAGE_CHANGE_PWD, "User requested password change", requestId);

        // change plain text passwords to KMF encrypted format
        var passwordResetUtil = new PasswordResetUtil();
        var encNewPassword = passwordResetUtil.encryptWithKMFModule(newPassword);
        var encOldPassword = passwordResetUtil.encryptWithKMFModule(oldPassword);

        if (this.evaluatePasswordRule(processId, encNewPassword, requestId) != "success") {
            result.status = this.STATUS_FAILURE;
            result.errorMessage = gs.getMessage("Invalid New Password");
            return result;
        }

        var outputs = pwdFlowHelper.startMasterSubFlow(requestId, encNewPassword, encOldPassword, this.CHANGE_PASSWORD_ACTION);

        if (outputs.is_flow == false) {
            if (!gs.nil(outputs.context_id)) {
                result.ctxId = outputs.context_id.sys_id;
            } else {
                result.errorMessage = gs.getMessage("Failed to start Password Change Workflow");
                result.status = this.STATUS_FAILURE;
            }
        } else if (outputs.is_flow == true && outputs.status == "Error") {
            result.status = this.STATUS_FAILURE;
            if (!gs.nil(outputs.error_message) && outputs.error_message != 'Flow stopped executing')
                result.errorMessage = outputs.error_message;
            else
                result.errorMessage = gs.getMessage("Change password request resulted in failure");

            trackingMgr.updateRequestStatusAndRetry(requestId, -1);
            trackingMgr.createActivity(PwdConstants.TYPE_ERROR, PwdConstants.STAGE_CHANGE_PWD, result.errorMessage, requestId);
        } else if (outputs.is_flow == true) {
            if (outputs.status == "Success") {
                trackingMgr.updateRequestStatusAndRetry(requestId, 1);
                trackingMgr.createActivity(PwdConstants.TYPE_INFO, PwdConstants.STAGE_CHANGE_PWD, "Password Changed Succesfully", requestId);
            } else {
                result.status = this.STATUS_PENDING;
                gs.getSession().putProperty('async_pwd_request', 'true');
                trackingMgr.updateRequestStatus(requestId, 3);
                trackingMgr.createActivity(PwdConstants.TYPE_INFO, PwdConstants.STAGE_CHANGE_PWD, "Password Changed request is Pending with external system", requestId);
            }
        }
        return result;
    },

    _startChangePasswordWorkflow: function(requestId, userId, encNewPassword, encOldPassword) {

        var params = {
            u_request_id: requestId,
            u_user_id: userId,
            u_new_password: encNewPassword,
            u_old_password: encOldPassword
        };

        return PWDWorkflowHelper.startFlow(this.CHANGE_PASSWORD_MASTER_WORKFLOW, params, 'update');
    },

    _isUserAuthorized: function(userId) {
        if (userId == gs.getUserID())
            return true;
        return false;
    },

    type: 'PWDChangePasswordBL'
};

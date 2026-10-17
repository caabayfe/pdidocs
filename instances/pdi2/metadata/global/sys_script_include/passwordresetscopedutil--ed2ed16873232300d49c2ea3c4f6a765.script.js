var PasswordResetScopedUtil = Class.create();
PasswordResetScopedUtil.prototype = {
    OOB_EMAILCODE_VERIFICATIONTYPE_SYSID: '47cf0e830b233200572a6f3ef6673a00',
    OOB_SMSCODE_VERIFICATIONTYPE_SYSID: '58a2f398eb6001006a668c505206fed3',
    OOB_PERSONALDATA_VERIFICATIONTYPE_SYSID: '2f39b371eb1101004d7763fba206fed1',
    OOB_SECURITYQUESTION_VERIFICATIONTYPE_SYSID: '39b15343eb10010045e1a5115206feb7',
    OOB_AUTHENTICATOR_VERIFICATION_SYSID: 'c7835ab787773200cfab6dd207cb0b88',
    SYSPARM_PROCESS_ID: 'sysparm_process_id',
    SYSPARM_REQUEST_ID: 'sysparm_request_id',
    SYSPARM_USERID: 'sysparm_sys_user_id',
    SYSPARM_REQUEST_SOURCE: 'sysparm_request_source',
    WF_STATE_FINISHED: 'finished',
    WF_STATE_FAILURE: 'failure',
    WF_POLL_TIMEOUT: 'timeout',
    PARM_NUM_RESET: 'num_reset',
    PARM_NUM_ENROLL: 'num_enroll',
    REQUEST_SOURCE_VA: 1,
    UNKNOWN: 0,
    TIMEOUT: -1,
    pollingTimeOut: 90000,
    sleepTime: 1000,
    REQUEST_TYPE: 3, // request type for Change Password
    REQUEST_ACTION_TYPE: 4, // request action type for Change Password
    STATE_VERIFIED: 2,
    RESET_FLOW_ACCEPT_PASSWORD: 0,
    RESET_FLOW_NOT_ACCEPT_PASSWORD: 1,
    STATUS_SUCCESS: 'success',
    STATUS_BLOCKED: 'block',
    CHANNEL_MWEB: 'mweb',
    CHANNEL_PHONE: 'phone',
    NOTIFY_EMAIL: "2",
    PWD_RESET_URL_NOTIFICATION: "9546d4509f131200f45c7b9ac42e70ca",
    UNSUBSCRIBE_NOTIFICATION_FILTER: "c1bfa4040a0a0b8b001eeb0f3f5ee961",
    DEFAULT_SELF_SERVICE_PROCESS_ID: 'c6b0c20667100200a5a0f3b457415ad5',
    CREATE_MODE: "create",
    UPDATE_MODE: "update",
    RESET_URL_TOKEN_VALIDATION_PENDING: 5,
    manager: new PwdEnrollmentManager(),
    initialize: function() {
        this.oobVerificationTypes = [this.OOB_AUTHENTICATOR_VERIFICATION_SYSID, this.OOB_EMAILCODE_VERIFICATIONTYPE_SYSID, this.OOB_PERSONALDATA_VERIFICATIONTYPE_SYSID, this.OOB_SECURITYQUESTION_VERIFICATIONTYPE_SYSID, this.OOB_SMSCODE_VERIFICATIONTYPE_SYSID];
        this.ivrSupportedVerificationTypes = [this.OOB_AUTHENTICATOR_VERIFICATION_SYSID, this.OOB_EMAILCODE_VERIFICATIONTYPE_SYSID, this.OOB_SMSCODE_VERIFICATIONTYPE_SYSID];
    },
    setChangePasswordFlowInTransaction: function() {
        var txn = GlideTransaction.get();
        txn.setAttribute("isChangePasswordFlow", "true");
    },
    authenticateUser: function(user_name, password) {
        var pwdUserManager = new SNC.PwdUserManager();
        var authed = pwdUserManager.authenticateUser(user_name, password);
        if (!authed) {
            return false;
        }
        return true;
    },
    updatePassword: function(user_name, password, passwordNeedsReset, unlockAccount) {
        var pwdUserManager = new SNC.PwdUserManager();
        var response = pwdUserManager.updatePassword(user_name, password, passwordNeedsReset, unlockAccount);
        return response;
    },
    isPasswordInHistory: function(user_name, password, credStoreID) {
        var pwdUtil = new SNC.PwdHistoryManager(credStoreID, user_name);
        if (pwdUtil.isPwdInHistory(password)) {
            return true;
        }
        return false;
    },
    add: function(user_name, password, credStoreID) {
        var pwdUtil = new SNC.PwdHistoryManager(credStoreID, user_name);
        pwdUtil.addToHistory(password);
    },
    passwordExtensionScript: function(Id, sys_id) {
        var params = new SNC.PwdExtensionScriptParameter();
        params.userId = Id;
        var userLookupExtension = new SNC.PwdExtensionScript(sys_id);
        var lookupResult = userLookupExtension.process(params);
        return lookupResult;
    },
    sendConfirmationEmail: function(eventName, gr, param1, param2) {
        var emailManager = new SNC.PwdEmailManager();
        emailManager.sendEmail(eventName, gr, param1, param2);
    },
    generatePassword: function(credStore) {
        var autoGenScript = credStore.auto_gen_password_script.name;
        var params = {
            credentialStoreId: credStore.getId(),
            enablePasswordPolicy: credStore.enable_password_policy,
            passwordPolicyId: credStore.password_policy
        };
        var tempPassword = new global[autoGenScript]().process(params);
        var finalTempPassword = new PasswordResetUtil().encryptWithKMFModule(tempPassword);
        return finalTempPassword;
    },
    isNotifyPluginEnabled: function() {
        return GlidePluginManager.isRegistered('com.snc.notify');
    },
    getChangePasswordProcessIds: function(userId) {
        if (gs.nil(userId))
            userId = gs.getUserID();
        var processIds = new SNC.PwdProcessManager().getChangePasswordProcessIds(userId, true);

        var processes = [];
        var pwdCredentialStoreMgr = new SNC.PwdCredentialStoreManager();
        for (i = 0; i < processIds.size(); i++) {
            var processID = processIds.get(i);

            if (pwdCredentialStoreMgr.getEnablePasswordPolicy(processID)) {
                processes.push(processID);
            }
        }
        return processes;
    },
    changePassword: function(userId, processId, newPassword, oldPassword) {
        return new PWDChangePasswordBL().changePassword(userId, processId, newPassword, oldPassword, this.REQUEST_SOURCE_VA);
    },
    getProcessIdByProcessURL: function(urlSuffix) {
        return new SNC.PwdProcessManager().getProcessIdByProcessURL(urlSuffix);
    },
    getProcessById: function(processId) {
        return new SNC.PwdProcess(processId);
    },
    getProcessIdsByUserId: function(userId) {
        var processIds = new SNC.PwdProcessManager().getProcessIdsByUserId(userId);
        return this._convertToArray(processIds);
    },
    getVerificationIdsByProcessId: function(processId) {
        return new SNC.PwdProcessManager().getVerificationIdsByProcessId(processId).toString();
    },
    getVerificationById: function(verificationId) {
        return new SNC.PwdVerification(verificationId);
    },
    getRedirectUrl: function(processId) {
        return new SNC.PwdProcess(processId).getRedirectUrl();
    },
    getProcessDetails: function(processId, channel, isResetPassword) {
        if (gs.nil(isResetPassword))
            isResetPassword = true;
        if (gs.nil(channel))
            channel = 'mweb';
        var processDetails;
        var process = new SNC.PwdProcess(processId);
        if (this._validateCompatibility(process, channel, isResetPassword)) {
            processDetails = {
                'value': process.getId(),
                'label': process.getLabel()
            };
        }
        return processDetails;
    },
    getIdentificationTypesByProcessId: function(processId) {
        var process = new SNC.PwdProcess(processId);
        var identificationTypeIds = process.getIdentificationTypeIds();
        return this._convertToArray(identificationTypeIds);
    },
    getIdentificationDetails: function(identificationTypeId) {
        var identificationType = new SNC.PwdIdentificationType(identificationTypeId);
        var details = {
            'processorId': identificationType.getIdentificationProcessorId(),
            'label': gs.getMessage(identificationType.getIdentificationLabel())
        };
        return details;
    },
    verifyIdentity: function(processId, userInputs, requestSource) {
        var source = requestSource != null ? requestSource : "Web";
        var pwdIdentifyStageBL = new global.PwdIdentifyStageBL();
        var param = new SNC.PwdExtensionScriptParameter();
        param.setParameter(this.SYSPARM_PROCESS_ID, processId);
        param.setParameter(this.SYSPARM_REQUEST_SOURCE, source);
        return pwdIdentifyStageBL.verifyIdentity(processId, userInputs, '', param, false);
    },
    getUserRequestDetails: function() {
        return {
            requestId: gs.getSession().getProperty(this.SYSPARM_REQUEST_ID),
            userId: gs.getSession().getProperty(this.SYSPARM_USERID)
        };
    },
    getVerificationParamValue: function(verificationId, param) {
        return new SNC.PwdVerificationManager().getVerificationParamValue(verificationId, param);
    },
    getEnablePasswordStrength: function(processId) {
        return new SNC.PwdCredentialStoreManager().getEnablePasswordStrength(processId);
    },
    populateSecurityQuestions: function(securityQuestionVerificationId, userId, requestId) {
        var pwdVerificationManager = new SNC.PwdVerificationManager();
        var paramValueNumReset = pwdVerificationManager.getVerificationParamValue(securityQuestionVerificationId, this.PARM_NUM_RESET);
        var paramValueNumEnroll = pwdVerificationManager.getVerificationParamValue(securityQuestionVerificationId, this.PARM_NUM_ENROLL);
        var pwdQuestionAnswerHelper = new global.PwdQuestionAnswerHelper();
        var enrolledQuestions = pwdQuestionAnswerHelper.getQuestionsList(requestId, userId, securityQuestionVerificationId, paramValueNumReset, paramValueNumEnroll);
        // Select random questions from enrolled questions
        var randomQuestions = [];
        for (var i = 0; i != paramValueNumReset; i++) {
            var item = Math.floor(Math.random() * enrolledQuestions.q_id.length);
            randomQuestions.push({
                "questionId": enrolledQuestions.q_id.splice(item, 1)[0],
                "question": enrolledQuestions.q.splice(item, 1)[0],
                "answerId": enrolledQuestions.answerId.splice(item, 1)[0],
                "hashType": enrolledQuestions.answerHashType.splice(item, 1)[0]
            });
        }
        return randomQuestions;
    },
    getSoftPINQuestion: function(verificationId) {
        var pwdVerificationManager = new SNC.PwdVerificationManager();
        var question = pwdVerificationManager.getVerificationParamValue(verificationId, 'question');
        return gs.getMessage(question);
    },
    isUserEnrolledForSoftPIN: function(userId, verificationId) {
        var softPINManager = new SNC.PwdSoftPINManager();
        return softPINManager.isUserEnrolled(userId, verificationId);
    },
    getSoftPINRecord: function(userId, verificationId) {
        var softPINManager = new SNC.PwdSoftPINManager();
        return softPINManager.getSoftPINByVerificationId(userId, verificationId);
    },
    getRandomSalt: function() {
        return new SNC.PwdQAManager().getSaltForString();
    },
    getSoftPINSaltForUser: function(userId, verificationId) {
        var softPINManager = new SNC.PwdSoftPINManager();
        var softPINSysId = softPINManager.getSoftPINByVerificationId(userId, verificationId);
        return softPINManager.getSalt(softPINSysId);
    },
    getVerificationsFromOtherApplications: function() {
        var verificationList = new GlideStringList();
        var pluginManager = new GlidePluginManager();
        var isCustomAdapterPluginActive = pluginManager.isActive('com.glide.cs.custom.adapter');
        var verificationIds = [];
        if (isCustomAdapterPluginActive) {
            try {
                verificationIds = new global.VaCustomAdapterPropertyUtil().getPwdVerificationIds();
                if (!gs.nil(verificationIds) && Array.isArray(verificationIds))
                    verificationIds.forEach(function(verification) {
                        verificationList.add(verification);
                    });
            } catch (e) {
                gs.warn('Plugin : [com.glide.cs.custom.adapter] is active, but failed in global.VaCustomAdapterPropertyUtil');
            }
        }
        return verificationList;
    },
    getVerification: function(verificationId, required) {
        var pwdVerification = new SNC.PwdVerification(verificationId);
        return {
            id: pwdVerification.getId(),
            label: pwdVerification.getLabel(),
            required: required,
            type: pwdVerification.getVerificationTypeId(),
            verified: false
        };
    },
    getPasswordRuleHint: function(processId, asHtml) {
        var enablePasswordPolicy = new SNC.PwdCredentialStoreManager().getEnablePasswordPolicy(processId);
        var passwordRuleHint = '';
        if (enablePasswordPolicy) {
            var passwordRuleHints = JSON.parse(SNC.PasswordPolicyEvaluator.getPasswordRuleHints(new SNC.PwdCredentialStoreManager().getPasswordPolicyId(processId)));
            var hints = "";
            for (i = 0; i < passwordRuleHints.length; i++) {
                var hint = asHtml == null || asHtml == false ? hint = "- " + passwordRuleHints[i].hint + "\n" : hint = "<p>- " + passwordRuleHints[i].hint + "</p>";
                hints = hints.concat(hint);
            }
            passwordRuleHint = hints;
        } else {
            var credentialStoreId = new SNC.PwdProcess(processId).getCredentialStoreId();
            passwordRuleHint = new SNC.PwdCredentialStore(credentialStoreId).getPasswordRuleDesc();
        }
        return passwordRuleHint;
    },
    getPasswordRules: function(processId) {
        var enablePasswordPolicy = new SNC.PwdCredentialStoreManager().getEnablePasswordPolicy(processId);
        if (enablePasswordPolicy) {
            var passwordRuleHints = JSON.parse(SNC.PasswordPolicyEvaluator.getPasswordRuleHints(new SNC.PwdCredentialStoreManager().getPasswordPolicyId(processId)));
            var rulesWithRegex = [];
            var rulesWithoutRegex = [];
            for (i = 0; i < passwordRuleHints.length; i++) {
                if (passwordRuleHints[i].regex != "")
                    rulesWithRegex.push(passwordRuleHints[i]);
                else
                    rulesWithoutRegex.push(passwordRuleHints[i]);
            }
            return {
                "rulesWithRegex": rulesWithRegex,
                "rulesWithoutRegex": rulesWithoutRegex
            };
        } else {
            var credentialStoreId = new SNC.PwdProcess(processId).getCredentialStoreId();
            var passwordRuleHint = new SNC.PwdCredentialStore(credentialStoreId).getPasswordRuleDesc();
            return passwordRuleHint;
        }
    },
    getStrengthRule: function(processId) {
        var credMgr = new SNC.PwdCredentialStoreManager();
        var enablePasswordPolicy = credMgr.getEnablePasswordPolicy(processId);
        var strengthRule = '';
        if (enablePasswordPolicy)
            strengthRule = SNC.PasswordPolicyEvaluator.getPasswordStrengthScript(credMgr.getPasswordPolicyId(processId));
        else
            strengthRule = credMgr.getStrengthRule(processId);
        return strengthRule;
    },
    verify: function(userId, processId, verificationId, requestId, userInput) {
        var verificationBL = new global.PwdVerifyStageBL();
        var verificationResult = verificationBL.checkVerification(userId, processId,
            verificationId, requestId, this._buildPwdExtenstionParameter(userInput));
        return verificationResult;
    },
    verifyAll: function(userId, processId, requestId, userInput) {
        var verificationBL = new global.PwdVerifyStageBL();
        var verificationResult = verificationBL.checkAllVerifications(userId, processId,
            requestId, this._buildPwdExtenstionParameter(userInput));
        if (verificationResult && new SNC.PwdProcess(processId).getEmailPasswordResetUrl()) {
            verificationBL.logInfo("Password reset link and token sent over Email/SMS", requestId);
            verificationBL.trackingMgr.updateRequestStatus(requestId, this.RESET_URL_TOKEN_VALIDATION_PENDING);
        }
        return verificationResult;
    },
    setUserLockState: function(processSysId, requestID, userID) {
        var process = this.getProcessById(processSysId);
        if (!process.getEmailPasswordResetUrl()) {
            return;
        }
        var credStroreGr = new GlideRecord('pwd_cred_store');
        if (credStroreGr.get(process.getCredentialStoreId())) {
            var credStoreType = credStroreGr.type;
            var isGetLockStateSubflowMapped = false;
            if (credStoreType.use_flow) {
                isGetLockStateSubflowMapped = credStoreType.get_lock_state_flow != '' ? true : false;
            } else {
                isGetLockStateSubflowMapped = credStoreType.get_lock_state_wf != '' ? true : false;
            }
            if (isGetLockStateSubflowMapped) {
                var unlockUtil = new PwdUserUnlockUtil();
                unlockUtil.startGetLockStateWorkflowNoVerification(requestID, userID);
            }
        }
    },
    pollAccountLockState: function(startTime, requestId) {
        gs.sleep(this.sleepTime);
        var state = new global.PwdUserUnlockUtil().getLockStateFromRequest(requestId);
        if (state == this.UNKNOWN) {
            var currentTime = new Date().getTime();
            if (currentTime - startTime > this.pollingTimeOut) {
                return this.TIMEOUT;
            } else {
                return this.pollAccountLockState(startTime, requestId);
            }
        } else {
            return state;
        }
    },
    canRetry: function(requestId) {
        var verificationBL = new global.PwdVerifyStageBL();
        var remainingRetries = verificationBL.trackingMgr.updateRequestRetry(requestId);
        return remainingRetries > 0 ? true : false;
    },
    pollPasswordResetWFState: function(contextId, startTime) {
        gs.sleep(this.sleepTime);
        var context = global.PWDWorkflowHelper.getWorkflowData(contextId, false);
        if (context.state != this.WF_STATE_FINISHED && context.result != this.WF_STATE_FAILURE) {
            var currentTime = new Date().getTime();
            if (currentTime - startTime > this.pollingTimeOut) {
                var timoutResult = {
                    result: this.WF_POLL_TIMEOUT
                };
                return timoutResult;
            } else {
                return this.pollPasswordResetWFState(contextId, startTime);
            }
        } else {
            return context;
        }
    },
    updateRequestStatus: function(requestId, status) {
        var verifyStageBL = new global.PwdVerifyStageBL();
        verifyStageBL.trackingMgr.updateRequestStatus(requestId, status);
    },
    isFlow: function(processId) {
        var pwdFlowHelper = new global.PwdFlowHelper();
        var result = pwdFlowHelper.useFlow(processId);
        return result;
    },
    sendSMSCode: function(requestId, verificationId, mode, providerId) {
        return new global.PwdSMSNotificationManager().sendResetCode(requestId,
            verificationId, mode, providerId);
    },
    sendSMSCodeToUser: function(requestId, verificationId, mode, providerId, userSysId) {
        return new global.PwdSMSNotificationManager().sendResetCodeToUser(requestId,
            verificationId, mode, providerId, userSysId);
    },
    sendEmailCode: function(requestId, verificationId, mode) {
        return new global.PwdEmailNotificationManager().sendResetCode(requestId,
            verificationId, mode);
    },
    createChangePasswordRequest: function(userId, processId) {
        var result = {
            status: this.STATUS_SUCCESS,
            requestId: '',
        };
        var trackingMgr = new SNC.PwdTrackingManager();
        var requestId = trackingMgr.createRequest(processId, userId, gs.getSessionID(), this.REQUEST_TYPE);
        trackingMgr.updateRequestActionType(requestId, this.REQUEST_ACTION_TYPE);
        this.updateRequestStatus(requestId, this.STATE_VERIFIED);
        // if locked quit
        if (trackingMgr.isRequestLocked(userId, processId)) {
            var blockedMsg = gs.getMessage("Cannot create request (process_id = {0}, user_sys_id = {1}) because the user is blocked.", [processId, userId]);
            trackingMgr.createActivity(PwdConstants.TYPE_ERROR, PwdConstants.STAGE_CHANGE_PWD, blockedMsg, requestId);
            // Leave request in progress state with retryCount of 0 - This way
            // the next try with reuse this request and not lose one retry count.
            result.status = this.STATUS_BLOCKED;
            return result;
        }
        result.requestId = requestId;
        return result;
    },
    getCredentialStoreType: function(processId) {
        return new SNC.PwdCredentialStore(new SNC.PwdProcess(processId).getCredentialStoreId()).getCredentialStoreTypeId();
    },
    startUnlockWorkflow: function(requestId, userId) {
        return new PwdUserUnlockUtil().startUnlcokWorkflow(requestId, userId);
    },
    isUnlockAccountEnabled: function(processId) {
        return new SNC.PwdProcess(processId).isUnlockAccount();
    },
    isResetPasswordProcess: function(processId) {
        return new SNC.PwdProcess(processId).isResetPwd();
    },
    isChangePasswordProcess: function(processId) {
        return new SNC.PwdProcess(processId).isChangePwd();
    },
    getSalt: function(answerId, requestId) {
        var isRequestInvalid = new SNC.PwdTrackingManager().isRequestInvalid(requestId);
        if (isRequestInvalid) {
            return new SNC.PwdQAManager().getSaltForString();
        } else
            return new SNC.PwdQAManager().getSalt(answerId);
    },
    _buildPwdExtenstionParameter: function(userInputs) {
        var pwdExtenstionParameter = new SNC.PwdExtensionScriptParameter();
        for (i = 0; i < userInputs.length; i++) {
            pwdExtenstionParameter.setParameter(userInputs[i].key, userInputs[i].value);
        }
        return pwdExtenstionParameter;
    },
    _convertToArray: function(object) {
        var array = [];
        for (i = 0; i < object.size(); i++) {
            array.push(object.get(i));
        }
        return array;
    },
    evaluatePasswordRule: function(processId, newPassword, requestId) {
        return new SNC.PwdCredentialStoreManager().evaluatePasswordRuleAdvance(processId, newPassword, requestId);
    },
    evaluatePasswordStrength: function(processId, newPassword) {
        return new SNC.PwdCredentialStoreManager().evaluatePasswordStrength(processId, newPassword);
    },
    _validateCompatibility: function(process, channel, isResetPassword) {
        if (process.getId() == null || !process.isPublic() || !process.isActive() ||
            process.isEnabledOnVA() != true) {
            return false;
        }

        //Enable password policy check only for Reset password
        if (isResetPassword && !new SNC.PwdCredentialStoreManager().getEnablePasswordPolicy(process.getId()))
            return false;

        var credentialStoreId = process.getCredentialStoreId();
        var isFlowAcceptPassword = false;
        var credStoreGr = new GlideRecord('pwd_cred_store');
        if (credStoreGr.get(credentialStoreId))
            isFlowAcceptPassword = !credStoreGr.type.use_flow || credStoreGr.type.password_delivery_mechanism == 0;

        //Check Autogen password only for Reset Password
        if (channel == this.CHANNEL_PHONE && isResetPassword && !process.getEmailPasswordResetUrl() && !process.isAutoGenPassword() && isFlowAcceptPassword) {
            return false;
        }
        var verifications = new SNC.PwdProcessManager().getVerificationIdsByProcessId(process.getId());
        for (var i = 0; i < verifications.size(); i++) {
            var verification = new SNC.PwdVerification(verifications.get(i));
            if ((channel == this.CHANNEL_MWEB) && (this.oobVerificationTypes.indexOf(verification.getVerificationTypeId()) > -1) ||
                ((channel == this.CHANNEL_PHONE) && (this.ivrSupportedVerificationTypes.indexOf(verification.getVerificationTypeId()) > -1))) {
                continue;
            } else {
                return false;
            }
        }
        return true;
    },
    getPasswordResetProcessURL: function(processId) {
        var processDetails = {};
        var process = new SNC.PwdProcess(processId);
        processDetails.url = process.getURL();
        processDetails.name = process.getLabel();
        processDetails.enabledOnChatBot = process.isEnabledOnVA();
        processDetails.unlockAccount = process.isUnlockAccount();
        return processDetails;
    },
    updatePasswordResetRequestStatus: function(requestId, requestStatus) {
        var COMPLETED_WITH_FAILURE = -1;
        var COMPLETED_WITH_SUCCESS = 1;
        var PENDING_WITH_EXTERNAL_SYSTEM = 3;
        var trackingMgr = new SNC.PwdTrackingManager();
        trackingMgr.updateRequestStatus(requestId, requestStatus);
        switch (requestStatus) {
            case COMPLETED_WITH_FAILURE:
                trackingMgr.createActivity(PwdConstants.TYPE_ERROR, PwdConstants.STAGE_RESET, 'Password reset failed', requestId);
                break;
            case PENDING_WITH_EXTERNAL_SYSTEM:
                trackingMgr.createActivity(PwdConstants.TYPE_INFO, PwdConstants.STAGE_RESET, 'Request is pending with external system', requestId);
                break;
            default:
                trackingMgr.createActivity(PwdConstants.TYPE_INFO, PwdConstants.STAGE_RESET, "Flow Completed Successfully", requestId);
        }
    },
    getNotificationProviders: function() {
        var options = [];
        var gr = new GlideRecord('cmn_notif_service_provider');
        gr.addActiveQuery();
        gr.addQuery('type', 'SMS');
        gr.orderBy('name');
        gr.query();
        while (gr.next()) {
            options.push({
                'value': gr.getValue('sys_id'),
                'label': gr.getValue('name')
            });
        }
        return options;
    },
    doesResetFlowAcceptPassword: function(processId) {
        var gr = new GlideRecord("pwd_process");
        if (gr.get(processId)) {
            if (gr.cred_store.type.use_flow)
                return gr.cred_store.type.password_delivery_mechanism;
            else
                return this.RESET_FLOW_ACCEPT_PASSWORD;
        } else
            return this.RESET_FLOW_NOT_ACCEPT_PASSWORD;
    },
    getTempPassword: function() {
        var tempPass = gs.getSession().getProperty('temp_password');
        gs.getSession().clearProperty("temp_password");
        return tempPass;
    },
    createRequestForReset: function(processId, userId, sessionID, requestType) {
        var trackingMgr = new SNC.PwdTrackingManager();
        return trackingMgr.createRequest(processId, userId, sessionID, requestType);
    },
    _isUserEnrolled: function(userId, processId) {
        var processManager = new SNC.PwdProcessManager();
        var enrollMgr = new SNC.PwdEnrollmentManager();
        var process = new SNC.PwdProcess(processId);
        var mandatoryVerificationIds = processManager.getProcessVerificationIdsByMandatoryFlag(processId, true);
        var optionalVerificationIds = processManager.getProcessVerificationIdsByMandatoryFlag(processId, false);
        var mandatoryVerificationIdsArray = mandatoryVerificationIds.toArray();
        var optionalVerificationIdsArray = optionalVerificationIds.toArray();
        var userEnrolled = false;
        var mandatoryVerificationEnrollmentCount = 0;
        for (var i = 0; i < mandatoryVerificationIdsArray.length; i++) {
            userEnrolled = enrollMgr.isUserEnrolledByVerificationId(userId, mandatoryVerificationIds.get(i));
            if (!userEnrolled) {
                return false;
            }
            mandatoryVerificationEnrollmentCount++;
        }
        var optionalVerificationEnrollmentCount = 0;
        for (i = 0; i < optionalVerificationIdsArray.length; i++) {
            userEnrolled = enrollMgr.isUserEnrolledByVerificationId(userId, optionalVerificationIds.get(i));
            if (userEnrolled) {
                optionalVerificationEnrollmentCount++;
            }
        }
        return (mandatoryVerificationEnrollmentCount + optionalVerificationEnrollmentCount) >= process.getMinVerifications();
    },
    _isNotificationEnabled: function(userSysId, processId) {
        var userGr = new GlideRecord("sys_user");
        userGr.get(userSysId);
        var email = userGr.getValue("email");
        var process = new SNC.PwdProcess(processId);
        if (process.getEmailPasswordResetUrl() || process.getSendEmail()) {
            if (gs.nil(email) || userGr.getValue("notification") != this.NOTIFY_EMAIL) {
                return false;
            }
            var deviceGr = new GlideRecord("cmn_notif_device");
            deviceGr.addQuery("user", userSysId);
            deviceGr.addQuery("email_address", email);
            deviceGr.addQuery("type", "Email");
            deviceGr.query();
            deviceGr.next();
            var notifGr = new GlideRecord("cmn_notif_message");
            notifGr.addQuery("user", userSysId);
            notifGr.addQuery("device", deviceGr.getUniqueValue());
            notifGr.addQuery("notification", this.PWD_RESET_URL_NOTIFICATION);
            notifGr.query();
            notifGr.next();
            var notifFilter = notifGr.getValue("notification_filter");
            return (notifFilter != this.UNSUBSCRIBE_NOTIFICATION_FILTER);
        }
        return true;
    },
    canUserResetPassword: function(userId, processId, requestId) {
        if (gs.nil(userId) || gs.nil(processId) || gs.nil(requestId))
            return false;
        var trackingMgr = new SNC.PwdTrackingManager();
        var process = new SNC.PwdProcess(processId);
        var userGr = new GlideRecord("sys_user");
        userGr.get(userId);
        var email = userGr.getValue("email");
        var source = userGr.getValue("source");
        if (processId == this.DEFAULT_SELF_SERVICE_PROCESS_ID) {
            var isLockedOut = process.unlock_account ? false : userGr.locked_out;
            if (isLockedOut)
                return false;
        }
        var isBlocked = trackingMgr.isRequestLocked(userId, processId);
        if (isBlocked)
            return false;
        var isUserNotificationDisabled = !this._isNotificationEnabled(userId, processId);
        if (isUserNotificationDisabled)
            return false;
        var isUserNotEnrolled = !this._isUserEnrolled(userId, processId);
        if (isUserNotEnrolled)
            return false;
        if (processId == this.DEFAULT_SELF_SERVICE_PROCESS_ID) {
            var isLDAP = SNC.PasswordResetUtil.isLDAPUser(userId);
            if (isLDAP)
                return false;
        }
        //Updating verification status
        var requestToVerificationGr = new GlideRecord('pwd_map_request_to_verification');
        requestToVerificationGr.addQuery('request', requestId);
        requestToVerificationGr.setValue('status', 'not_verified');
        requestToVerificationGr.updateMultiple();
        return true;
    },
    getEntitledPasswordResetProcesses: function(userId) {
        return new global.PwdVAEnrollmentManager().getEntitledPasswordResetProcesses(userId);
    },
    getEnrollmentVerificationsForProcess: function(userId, processId) {
        return new global.PwdVAEnrollmentManager().getEnrollmentVerificationsForProcess(userId, processId);
    },
    getSoftPinRules: function(verificationId) {
        return new global.PwdVAEnrollmentManager().getSoftPinRules(verificationId);
    },
    getSoftPinExpirationDays: function() {
        return new SNC.PwdSoftPINManager().getPinExpirationDays();
    },
    validateSoftPin: function(pin, verificationId) {
        return new global.PwdVAEnrollmentManager().validateSoftPin(pin, verificationId);
    },
    createOrUpdateSoftPin: function(pin, verificationid, userId) {
        return new global.PwdVAEnrollmentManager().createOrUpdateSoftPin(pin, verificationid, userId);
    },
    isUserEnrolledForSecurityQuestions: function(userId, verificationId) {
        return new global.PwdVAEnrollmentManager().isUserEnrolledForSecurityQuestions(userId, verificationId);
    },
    getSecurityQuestionsExcept: function(selectedQuestions) {
        return new global.PwdVAEnrollmentManager().getSecurityQuestionsExcept(selectedQuestions);
    },
    getNumOfQuestionsToEnroll: function(verificationid) {
        return new global.PwdVAEnrollmentManager().getNumOfQuestionsToEnroll(verificationid);
    },
    validateQuestionAnswers: function(answer, newAnswers, enrolledData) {
        return new global.PwdVAEnrollmentManager().validateQuestionAnswers(answer, newAnswers, enrolledData);
    },
    getEnrolledAnswerIds: function(userId, verificationId) {
        return new global.PwdVAEnrollmentManager().getEnrolledAnswerIds(userId, verificationId);
    },
    getEnrolledQuestionIds: function(userId, verificationId) {
        return new global.PwdVAEnrollmentManager().getEnrolledQuestionIds(userId, verificationId);
    },
    getEnrolledQuestions: function(userId, verificationId) {
        return new global.PwdVAEnrollmentManager().getEnrolledQuestions(userId, verificationId);
    },
    isQAConfigurationChanged: function(userId, verificationId) {
        return new global.PwdVAEnrollmentManager().isQAConfigurationChanged(userId, verificationId);
    },
    createOrUpdateSecurityQuestions: function(data, mode, userId, verificationId) {
        return new global.PwdVAEnrollmentManager().createOrUpdateSecurityQuestions(data, mode, userId, verificationId);
    },
    isMFAEnabledForUser: function(userId, verificationId) {
        return new global.PwdVAEnrollmentManager().isMFAEnabledForUser(userId, true, verificationId);
    },
    enableMFAVerification: function(userId, verificationId) {
        return new global.PwdVAEnrollmentManager().enableMFAVerification(userId, verificationId);
    },
    getMFAContent: function() {
        return new global.PwdVAEnrollmentManager().getMFAContent();
    },

    disableMFA: function(userId, verificationId) {
        return new global.PwdVAEnrollmentManager().disableMFA(userId, verificationId);
    },

    resetMFACode: function(userId, verificationId) {
        return new global.PwdVAEnrollmentManager().resetMFACode(userId, verificationId);
    },

    validateAndEnrollMFA: function(input, userId, verificationId) {
        return new global.PwdVAEnrollmentManager().validateAndEnrollMFA(input, userId, verificationId);
    },

    getHTMLContentForQRCode: function(qrCodeURL, qrCodeText) {
        return new global.PwdVAEnrollmentManager().getHTMLContentForQRCode(qrCodeURL, qrCodeText);
    },

    getSMSDevices: function(userId, maskPhoneNumber) {
        return new global.PwdVAEnrollmentManager().getSMSDevices(userId, maskPhoneNumber);
    },

    isNotifyEnabled: function() {
        return new global.PwdVAEnrollmentManager().isNotifyEnabled();
    },

    getCountryCodes: function() {
        var codes = JSON.parse(new global.PwdVAEnrollmentManager().getCountryCodes());
        var options = [];
        for (var key in codes) {
            options.push({
                'value': key,
                'label': key + " (" + codes[key] + ")"
            });
        }
        return options;
    },

    addNewSMSDevice: function(userId, verificationId, useNotify, deviceName, countryName, provider, phoneNumber) {
        var codes = JSON.parse(new global.PwdVAEnrollmentManager().getCountryCodes());
        var countryCode = codes[countryName];
        return new global.PwdVAEnrollmentManager().addNewSMSDevice(userId, verificationId, useNotify, deviceName, countryName, countryCode, provider, phoneNumber);
    },

    sendEnrollmentCode: function(deviceId, verificationId) {
        return new global.PwdVAEnrollmentManager().sendEnrollmentCode(deviceId, verificationId);
    },

    verifyEnrollmentCode: function(userId, deviceId, verificationId, code) {
        return new global.PwdVAEnrollmentManager().verifyEnrollmentCode(userId, deviceId, verificationId, code);
    },

    getDeviceId: function(userId, phone) {
        return new global.PwdVAEnrollmentManager().getDeviceId(userId, phone);
    },

    removeSMSDevice: function(userId, verificationId, deviceId) {
        return new global.PwdVAEnrollmentManager().removeSMSDevice(userId, verificationId, deviceId);
    },

    updateSubscriptionOfDevice: function(userId, verificationId, deviceId, deviceName, isSubscribed) {
        return new global.PwdVAEnrollmentManager().updateSubscriptionOfDevice(userId, verificationId, deviceId, deviceName, isSubscribed);
    },

    getEmails: function(userId, maskEmailAddr) {
        return new global.PwdVAEnrollmentManager().getEmails(userId, maskEmailAddr);
    },

    addNewEmailDevice: function(userId, emailAddress, emailName) {
        return new global.PwdVAEnrollmentManager().addNewEmailDevice(userId, emailAddress, emailName);
    },

    getEmailDeviceId: function(userId, emailAddress) {
        return new global.PwdVAEnrollmentManager().getEmailDeviceId(userId, emailAddress);
    },

    sendEmailEnrollmentCode: function(deviceId, verificationId) {
        return new global.PwdVAEnrollmentManager().sendEmailEnrollmentCode(deviceId, verificationId);
    },

    verifyEmailEnrollmentCode: function(userId, deviceId, verificationId, code) {
        return new global.PwdVAEnrollmentManager().verifyEmailEnrollmentCode(userId, deviceId, verificationId, code);
    },

    addPrimaryEmail: function(userId, verificationId) {
        return new global.PwdVAEnrollmentManager().addPrimaryEmail(userId, verificationId);
    },

    getEncryptedValue: function(answer) {
        return new SNC.PwdQAManager().getEncryptedValue(answer);
    },

    getDecryptedAnswer: function(answer) {
        return new PasswordResetUtil().decryptWithKMFModule(answer);
    },

    getEnrolledQuestionsAnswerIds: function(userId, verificationId) {
        return new global.PwdVAEnrollmentManager().getEnrolledQuestionsAnswerIds(userId, verificationId);
    },

    updateResetRequestSource: function(requestId, source) {
        var trackingMgr = new SNC.PwdTrackingManager();
        trackingMgr.updateRequestSource(requestId, source);
    },

    getUserByID: function(userId) {
        return GlideUser.getUserByID(userId);
    },
    isRequestInvalid: function(requestId) {
         return new SNC.PwdTrackingManager().isRequestInvalid(requestId);
    },
    type: 'PasswordResetScopedUtil'
};

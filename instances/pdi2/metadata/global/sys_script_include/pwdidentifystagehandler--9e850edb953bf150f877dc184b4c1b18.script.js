var PwdIdentifyStageHandler = Class.create();
PwdIdentifyStageHandler.prototype = {
    initialize: function() {},
    trackingMgr: new SNC.PwdTrackingManager(),
    identifyBL: new PwdIdentifyStageBL(),
    pwdResetRespConst: new PasswordResetResponseConstants(),

    /* public methods begin { */
    /*
     * @param {string} userId
     * @returns {JSONArray} result
     * [{
     * 		procName:,
     * 		procSysId:
     * }]
     * 
     */

    getProcessesForUser: function(userId) {
        var processIds = new SNC.PwdProcessManager().getProcessIdsByUserId(userId);
        var result = [];
        for (var i = 0; i < processIds.size(); i++) {
            var procId = processIds.get(i);
            var procName = this._getServiceDeskProcessNameBySysId(procId);

            if (!gs.nil(procName)) {
                result.push({
                    procName: procName,
                    procSysId: procId
                });
            }
        }
        return result;
    },

    /*
     * @param {string} processId
     * @returns {string} processName
     */
    _getServiceDeskProcessNameBySysId: function(processId) {
        var proc = new SNC.PwdProcess(processId);

        // process needs to be either reset password or unlock account process 
        // we do not need to show public processes
        if (proc.isPublic() || !(proc.isResetPwd() || proc.isUnlockAccount())) {
            return null;
        }

        var processName = proc.getLabel();

        // prefix with domain name if plugin is active
        if (GlidePluginManager.isRegistered("com.glide.domain.msp_extensions.installer"))
            processName = proc.getDomainDisplayName() + ": " + processName;

        return processName;
    },

    /*
     * @param {string} userSysId
     * @param {string} processSysId
     * @returns {object} PasswordResetResponseUtility
     */
    identifyUserForServiceDesk: function(userSysId, processSysId) {
        var pwdResetResponseUtility = new global.PasswordResetResponseUtility();
        if (gs.nil(userSysId) || gs.nil(processSysId)) {
            pwdResetResponseUtility.setError(this.pwdResetRespConst.DEFAULT_ERROR_CODE);
            return pwdResetResponseUtility;
        }

        var requestId = this._createRequest(userSysId, processSysId);

        if (this.trackingMgr.isRequestLocked(userSysId, processSysId)) {
            this.trackingMgr.createActivity(PwdConstants.TYPE_ERROR, PwdConstants.STAGE_IDENTIFICATION, this.pwdResetRespConst.USER_BLOCKED_ERROR, requestId);
            var expTime = this.trackingMgr.getBlockedUserExpirationTime(userSysId, processSysId);
            if (gs.nil(expTime))
                pwdResetResponseUtility.setError(this.pwdResetRespConst.DEFAULT_ERROR_CODE);
            else
                pwdResetResponseUtility.setError(this.pwdResetRespConst.ERROR_CODE_FOR_BLOCK, [this._getRemainingHours(expTime)]);
            this.trackingMgr.updateRequestStatus(requestId, PwdConstants.REQUEST_STATE_COMPLETED_WITH_FAILURE);
            return pwdResetResponseUtility;
        }

        var isEnrolled = this._getUserEnrollmentStatus(userSysId, processSysId, requestId);

        if (!isEnrolled) {
            this.trackingMgr.createActivity(PwdConstants.TYPE_ERROR, PwdConstants.STAGE_IDENTIFICATION, this.pwdResetRespConst.USER_NOT_ENROLLED_ERROR, requestId);
            pwdResetResponseUtility.setError(this.pwdResetRespConst.ERROR_CODE_FOR_NOT_ENROLLED, [new SNC.PwdProcess(processSysId).getName()]);
        } else {
            this._setRequiredPropsForServiceDesk(requestId, userSysId);
            this._callGetLockStateFlow(requestId, userSysId, processSysId);
            this.identifyBL._resetVerificationsStatus(requestId);
        }
        return pwdResetResponseUtility;
    },

    /*
     * @param {string} processSysId
     * @param {string} sysparmCaptcha
	 * @param {object} request
	 * @param {JSON Array} idenObjs
	 * [{
	 *  user_input:,
        processor_id:
	 * }]
     * @returns {JSON} result
     * {
     *  isError: boolean,
     *  errorMsg: string,
		* "200"  - If user exists & is enrolled for the process.
		* "500"  - If, for any reason, does not exist or enrolled for the process.
		* "bad captcha" - The user submitted captcha was invalid.
     * }
     */
    verifyIdentityForSelfService: function(processSysId, idenObjs, sysparmCaptcha, request) {
        var pwdResetResponseUtility = new global.PasswordResetResponseUtility();
        pwdResetResponseUtility.setSuccess('200');
        // verify identity
        var res = this.identifyBL.verifyIdentity(processSysId, idenObjs, sysparmCaptcha, request);

        // verification failed, return error message
        if (res !== "ok") {
            pwdResetResponseUtility.setError(this._obfuscateResponse(res));
        } else
            this._callGetLockStateFlow(gs.getSession().getProperty('sysparm_request_id'), gs.getSession().getProperty('sysparm_sys_user_id'), processSysId);

        return pwdResetResponseUtility;
    },
    /* public methods end } */

    /* private methods begin { */
    //get the account lock state asynchronously if the Get lock state subflow is mapped at the cred_store_type level
    _callGetLockStateFlow: function(requestId, userSysId, processSysId) {
        var proc = new GlideRecord('pwd_process');
        proc.get(processSysId);

        var isGetLockStateSubflowMapped = false;

        // Start a workflow/subflow to retrieve the user's lock state
        if (proc.cred_store.type.use_flow) {
            isGetLockStateSubflowMapped = proc.cred_store.type.get_lock_state_flow != '' ? true : false;
        } else {
            isGetLockStateSubflowMapped = proc.cred_store.type.get_lock_state_wf != '' ? true : false;
        }
        if (isGetLockStateSubflowMapped) {
            new PwdUserUnlockUtil().startGetLockStateWorkflowNoVerification(requestId, userSysId);
        }
    },

    /*
     * @param {string} dateTimeStr 
     * @returns {string}
     */
    _getRemainingHours: function(dateTimeStr) {
        if (gs.nil(dateTimeStr))
            return null;

        var expDateTime = new GlideDateTime(dateTimeStr);
        var currentDateTime = new GlideDateTime();
        var durInSeconds = gs.dateDiff(currentDateTime, expDateTime, true); // returns the number of seconds as String
        return Math.round(durInSeconds / 3600);
    },

    _createRequest: function(userSysId, processSysId) {
        return this.trackingMgr.createRequest(processSysId, userSysId, gs.getSessionID(), PwdConstants.SERVICE_DESK_REQUEST_TYPE);
    },

    _getUserEnrollmentStatus: function(userSysId, processSysId, requestId) {
        return new SNC.PwdEnrollmentManager().isUserEnrolledByProcessId(userSysId, processSysId, requestId);
    },

    //reset the request state and set all the required session parameters
    _setRequiredPropsForServiceDesk: function(requestId, userSysId) {
        this.trackingMgr.createActivity(PwdConstants.TYPE_INFO, PwdConstants.STAGE_IDENTIFICATION, "User identified successfully", requestId);
        gs.getSession().putProperty('sysparm_request_id', requestId);
        gs.getSession().putProperty('sysparm_sys_user_id', userSysId);

        // Reset lock_state to 'Unknown'
        var req = new GlideRecord('pwd_reset_request');
        if (req.get(requestId)) {
            if (req.lock_state != 0) {
                req.lock_state = 0; // unknown
                req.update();
            }
            // Get user name and add it to the session in case the verification fails as we need to show the user name
            gs.getSession().putProperty('sysparm_user_input', req.user.name.toString());
        }
    },

    /* eslint-enable consistent-return */
    _obfuscateResponse: function(response) {
        if (!response ||
            response.includes(this.pwdResetRespConst.BLOCK_ERROR) ||
            response.includes(this.pwdResetRespConst.USER_DOESNT_EXIST_ERROR) ||
            response.includes(this.pwdResetRespConst.USER_NOT_ENROLLED_ERROR) ||
            response.includes(this.pwdResetRespConst.PROCESS_NOT_APPLICABLE_ERROR) ||
            response.includes(this.pwdResetRespConst.NOTIFICATION_NOT_ENABLED_ERROR) ||
            response.includes(this.pwdResetRespConst.USER_LOCKED_ERROR) ||
            response.includes(this.pwdResetRespConst.LDAP_ERROR))
            return '500';
        else
            return response;
    },
    /* private methods end } */

    type: 'PwdIdentifyStageHandler'
};

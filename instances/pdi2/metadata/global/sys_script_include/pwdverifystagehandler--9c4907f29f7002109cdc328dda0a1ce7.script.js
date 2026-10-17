var PwdVerifyStageHandler = Class.create();
PwdVerifyStageHandler.prototype = {
    initialize: function() {},
    verifyBL: new PwdVerifyStageBL(),

    /*
     * verifyUser() - Server side function for verifying the user (iterate through the various verification methods).
     * 
     * Return value:
     * "ok"     - if user is verified (by ALL verification methods).
     * "block"  - If too many attempts where made, and we'd like to block this user.
     * response object  - Contains retry count, Request Id, User input, Process Id, Verification Id, User Id
     */
    verifyUser: function(verificationId, requestObj, buildPwdExtensionScriptParameter) {
        var userId = gs.getSession().getProperty('sysparm_sys_user_id');
        var requestId = gs.getSession().getProperty('sysparm_request_id');
        var userInput = gs.getSession().getProperty('sysparm_user_input');

        // return error if the request does not exist
        if (!this.verifyBL.requestExists(requestId))
            return "block";

        var processId = this.verifyBL.trackingMgr.getProcessIdByRequestId(requestId);
        // If a verification id is specified, then only check that one. Otherwise, check all verifications
        // for the process. Only "checkAllVerifications" (for the process) can advance the verification stage.
        var isFinalVerification = false;
        var isValid = false;

        if (!gs.nil(buildPwdExtensionScriptParameter))
            requestObj = this._buildParam(requestObj);

        if (!gs.nil(verificationId)) {
            isValid = this.verifyBL.checkVerification(userId, processId, verificationId, requestId, requestObj);
        } else {
            isValid = this.verifyBL.checkAllVerifications(userId, processId, requestId, requestObj) === true;
            isFinalVerification = isValid;
        }

        // return error if all verifications were not successful:
        if (!isValid)
            return this._handleRetry(requestId, userInput, processId, verificationId, userId);
        else if (isFinalVerification) {
            var requestStatus = this.verifyBL.trackingMgr.getRequestStatus(requestId);
            if (requestStatus != PwdConstants.REQUEST_STATE_PENDING_WITH_EXTERNAL_SYSTEM_STATUS) {
                var isRequestInvalid = this.verifyBL.trackingMgr.isRequestInvalid(requestId);
                var status;
                if (isRequestInvalid) {
                    status = PwdConstants.REQUEST_STATE_NOT_VERIFIED;
                } else {
                    if (new SNC.PwdProcess(processId).getEmailPasswordResetUrl()) {
                        status = PwdConstants.REQUEST_STATE_RESET_URL_TOKEN_VALIDATION_PENDING;
                        this.verifyBL.logInfo("Password reset link and token sent over Email/SMS", requestId);
                    } else {
                        status = PwdConstants.REQUEST_STATE_VERIFIED;
                    }
                    gs.getSession().putProperty('sysparm_is_verified', true);
                }
                this.verifyBL.trackingMgr.updateRequestStatus(requestId, status);
            }
        }
        return "ok";
    },

    _handleRetry: function(requestId, userInput, processId, verificationId, userId) {
        // Every failed attempt consumes attempt budget, including the whole-form
        // path (no verification id). That path still evaluates the submitted secret
        // via checkAllVerifications, so returning without accounting for it would
        // allow unlimited guesses against password_reset.request.max_attempt.
        var retry = this.verifyBL.trackingMgr.updateRequestRetry(requestId);
        if (gs.nil(verificationId)) {
            this.verifyBL.logWarning("Verification failed", requestId);
            if (retry < 0)
                return "block";
            this.verifyBL.trackingMgr.updateRequestStatus(requestId, PwdConstants.REQUEST_STATE_NOT_VERIFIED);
            return "block";
        }
        this.verifyBL.logWarning("Attempt " + retry + " failed, allowing retry", requestId);
        var response = {
            "retry": retry,
            "requestId": requestId,
            "userInput": userInput,
            "processId": processId,
            "verificationId": verificationId,
            "userId": userId
        };
        return response;
    },

    _buildParam: function(userInputObj) {
        var requestObj = new SNC.PwdExtensionScriptParameter();
        Object.keys(userInputObj).forEach(function(param) {
            requestObj.setParameter(param, userInputObj[param]);
        });
        return requestObj;
    },

    type: 'PwdVerifyStageHandler'
};

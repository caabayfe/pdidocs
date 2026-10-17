var PwdCommonUtils = Class.create();
PwdCommonUtils.prototype = {
    initialize: function() {},
    SYSPARM_USERID: 'sysparm_sys_user_id',
    SYSPARM_REQUEST_ID: 'sysparm_request_id',
    pwdResetRespConst: new global.PasswordResetResponseConstants(),

    //Generates a new CSRF token, store that in a session variable and returns 
    generateCSRFToken: function() {
        return new SNC.PwdSecurityManager().generateSecureToken();
    },

    /**
     * Validates CSRF violation.
     */
    validateCSRFToken: function(token) {
        var securityMgr = new SNC.PwdSecurityManager();
        var result = securityMgr.validateSecureToken(token);

        //remove the stored security token.
        if (!result) {
            securityMgr.removeSecurityToken();
        }
        return result;
    },

    // Handle response code and return response message for SMS/Email verification code
    handleGenerateCodeResponse: function(response, verificationId) {
        var pwdResetResponseUtility = new global.PasswordResetResponseUtility();
        if (response == PwdConstants.SUCCESS_RESPONSE) {
            var expiry = new SNC.PwdSMSManager().getExpiryByVerificationId(verificationId);
            pwdResetResponseUtility.setSuccess(this.pwdResetRespConst.VERIFICATION_CODE_SENT, [expiry]);
        } else {
            switch (response) {
                case PwdConstants.PER_DAY_LIMIT_RESPONSE:
                    var per_day_limit = this.getVerificationParam(verificationId, "max_per_day", "password_reset.sms.max_per_day", '10');
                    pwdResetResponseUtility.setError(this.pwdResetRespConst.PER_DAY_LIMIT_ERROR, [per_day_limit]);
                    break;
                case PwdConstants.PAUSE_WINDOW_RESPONSE:
                    var pause_window = this.getVerificationParam(verificationId, "pause_window", "password_reset.sms.pause_window", '2');
                    pwdResetResponseUtility.setError(this.pwdResetRespConst.PAUSE_WINDOW_ERROR, [pause_window]);
                    break;
                case PwdConstants.INVALID_REQUEST_RESPONSE:
                    pwdResetResponseUtility.setError(this.pwdResetRespConst.INVALID_REQUEST_ERROR);
                    break;
                case PwdConstants.INVALID_PHONE_NUMBER:
                    pwdResetResponseUtility.setError(this.pwdResetRespConst.INVALID_PHONE_NUMBER_ERROR);
                    break;
                default:
                    pwdResetResponseUtility.setError(this.pwdResetRespConst.CODE_GENERATE_ERROR);
            }
        }
        return pwdResetResponseUtility;
    },

    getVerificationParam: function(verificationId, parameter, property, propertyDefaultValue) {
        var value = new SNC.PwdVerificationManager().getVerificationParamValue(verificationId, parameter);
        if (gs.nil(value)) {
            value = GlideProperties.get(property, propertyDefaultValue);
        }
        return value;
    },

    //fetches the requestId & userId from the current session
    getUserRequestDetails: function() {
        return {
            requestId: gs.getSession().getProperty(this.SYSPARM_REQUEST_ID),
            userId: gs.getSession().getProperty(this.SYSPARM_USERID)
        };
    },

    //creates an activity log for a given request. Can be tagged with a record using refTable & refSysId 
    createActivity: function(type, stage, message, requestId, refTable, refSysId) {
        new SNC.PwdTrackingManager().createActivity(type, stage, message, requestId, refTable, refSysId);
    },

	// Confirm the client-supplied reset request id belongs to the caller's own session.
	isRequestBoundToSession: function(requestId) {
		var sessionRequestId = this.getUserRequestDetails().requestId;
		return !gs.nil(sessionRequestId) && ((requestId + '') === (sessionRequestId + ''));
	},

    type: 'PwdCommonUtils'
};

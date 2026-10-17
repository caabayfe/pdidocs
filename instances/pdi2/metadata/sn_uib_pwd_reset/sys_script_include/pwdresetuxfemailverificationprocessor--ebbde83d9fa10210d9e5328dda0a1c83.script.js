var PwdResetUXFEmailVerificationProcessor = Class.create();
PwdResetUXFEmailVerificationProcessor.prototype = {
    initialize: function() {
        this.pwdCommonUtils = new global.PwdCommonUtils();
        this.pwdUserEnrollmentServiceForEmail = new global.PwdUserEnrollmentServiceForEmail();
    },

    CONSTANTS: {
        MODE: {
            SUBSCRIPTION: "subscription",
            NOT_ENROLLED: "notEnrolled"
        },
        PAUSE_WINDOW: {
            PARAM_NAME: "pause_window",
            PROPERTY_NAME: "password_reset.sms.pause_window",
            DEFAULT_VALUE: "2"
        }
    },

    getInitialData: function(token, verificationId) {
        if (gs.nil(verificationId)) return null;

        var initialData = {};
        var data = this._validateAndFetchUserDetails(token);
        if (!data.tokenValidationResult.isValid) return data;
        initialData.tokenValidationResult = data.tokenValidationResult;
        var requestId = data.requestId;

        var label = new global.PwdCommonVerificationHandler().getVerificationLabel(verificationId);
        var response = this.pwdUserEnrollmentServiceForEmail.getEmailDetails(requestId);
        initialData.mode = response.mode;
        var verifiedEmailList = [];
        switch (response.mode) {
            case this.CONSTANTS.MODE.SUBSCRIPTION:
                var emailList = response.emailList;
                for (var i = 0; i < emailList.length; i++) {
                    var emailObj = emailList[i];
                    var validEmail = emailObj.isSubscribed == true ? emailObj.isVerified == true : false;
                    if (validEmail)
                        verifiedEmailList.push(emailObj.email);
                }
                break;
            case this.CONSTANTS.MODE.NOT_ENROLLED:
                verifiedEmailList.push(response.email);
                break;
        }
        initialData.emailList = verifiedEmailList;
        initialData.label = label;
        return initialData;
    },

    generateCode: function(token, verificationId, mode) {
        if (gs.nil(verificationId) || gs.nil(mode)) return null;

        var response = {};
        var data = this._validateAndFetchUserDetails(token);
        if (!data.tokenValidationResult.isValid) return data;
        response.tokenValidationResult = data.tokenValidationResult;
        var requestId = data.requestId;

        var responseCode = this.pwdUserEnrollmentServiceForEmail.generateCode(requestId, verificationId, mode);
        response.emailStatus = this.pwdCommonUtils.handleGenerateCodeResponse(responseCode, verificationId);

        // Fetching code pause_window
        var pauseWindow = this.pwdCommonUtils.getVerificationParam(verificationId, this.CONSTANTS.PAUSE_WINDOW.PARAM_NAME, this.CONSTANTS.PAUSE_WINDOW.PROPERTY_NAME, this.CONSTANTS.PAUSE_WINDOW.DEFAULT_VALUE);
        response.pauseWindow = Number(pauseWindow) * 60 + "";
        return response;
    },

    _validateAndFetchUserDetails: function(token) {
        var data = {};
        // validate token before data fetch execution
        var tokenValidationResult = new PwdResetUXFUtil().getSecurityValidationResult(token);
        data.tokenValidationResult = tokenValidationResult;
        if (!tokenValidationResult.isValid) {
            return data;
        }
        // User details
        var userRequestDetails = this.pwdCommonUtils.getUserRequestDetails();
        data.requestId = userRequestDetails.requestId;
        return data;
    },

    type: 'PwdResetUXFEmailVerificationProcessor'
};

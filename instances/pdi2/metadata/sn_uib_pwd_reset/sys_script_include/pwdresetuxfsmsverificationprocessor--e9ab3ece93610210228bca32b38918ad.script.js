var PwdResetUXFSMSVerificationProcessor = Class.create();
PwdResetUXFSMSVerificationProcessor.prototype = {
    initialize: function() {
        this.pwdCommonUtils = new global.PwdCommonUtils();
        this.pwdUserEnrollmentServiceForSMS = new global.PwdUserEnrollmentServiceForSMS();
        this.pwdResetUxfUtil = new PwdResetUXFUtil();
    },

    CONSTANTS: {
        MODE: {
            SUBSCRIPTION: "subscription",
            MOBILE: "mobile"
        },
        PAUSE_WINDOW: {
            PARAM_NAME: "pause_window",
            PROPERTY_NAME: "password_reset.sms.pause_window",
            DEFAULT_VALUE: "2"
        },
        CHAR: {
            CROSS: "x",
            ASTERISK: "*"
        }
    },

    getInitialData: function(token, verificationId) {
        if (gs.nil(verificationId)) return null;

        var initialData = this._validateTokenAndGetUserReqData(token);
        if (!initialData.tokenValidationResult.isValid) return initialData;
        var requestId = initialData.userRequestDetails.requestId;

        // Get label
        var label = new global.PwdCommonVerificationHandler().getVerificationLabel(verificationId);

        // Get SMS verification details
        var response = this.pwdUserEnrollmentServiceForSMS.getSMSDetails(requestId);
        initialData.isUsingNotify = response.isUsingNotify;
        initialData.label = label;
        initialData.mode = response.mode;
        switch (response.mode) {
            case this.CONSTANTS.MODE.SUBSCRIPTION:
                var deviceList = response.deviceList.filter(function(device) {
                    return device.isSubscribed;
                });
                deviceList.forEach(function(device) {
                    device.phone = this._replaceCharWithMask(device.phone, this.CONSTANTS.CHAR.CROSS, this.CONSTANTS.CHAR.ASTERISK);
                }, this);
                initialData.deviceList = deviceList;
                break;
            case this.CONSTANTS.MODE.MOBILE:
                initialData.deviceList = [{
                    phone: this._replaceCharWithMask(response.phone, this.CONSTANTS.CHAR.CROSS, this.CONSTANTS.CHAR.ASTERISK)
                }];
                if (response.isUsingNotify) {
                    initialData.isPhoneNumberE164Compliant = response.isPhoneNumberE164Compliant;
                    if (!response.isPhoneNumberE164Compliant) {
                        var countryListObj = JSON.parse(response.countryList);
                        initialData.countryList = Object.keys(countryListObj).map(function(countryName) {
                            return {
                                id: countryName,
                                label: "(" + countryListObj[countryName] + ") " + countryName,
                                value: {
                                    countryName: countryName,
                                    countryCode: countryListObj[countryName]
                                }
                            };
                        });
                    }
                } else {
                    initialData.providerList = response.providerList.map(function(provider) {
                        return {
                            id: provider.sys_id,
                            label: provider.name
                        };
                    });
                }
                break;
        }
        return initialData;
    },

    sendSMSVerificationCode: function(token, verificationId, mode, providerId, countryCode, countryName) {
        if (gs.nil(verificationId) || gs.nil(mode)) return null;

        var uxfResponse = this._validateTokenAndGetUserReqData(token);
        if (!uxfResponse.tokenValidationResult.isValid) return uxfResponse;
        var requestId = uxfResponse.userRequestDetails.requestId;

        // Send SMS verification code
        var response = this.pwdUserEnrollmentServiceForSMS.generateCode(
            requestId,
            verificationId,
            mode,
            providerId,
            countryCode,
            countryName
        );
        var sendSMSCodeResponse = this.pwdCommonUtils.handleGenerateCodeResponse(response, verificationId);
        uxfResponse.response = sendSMSCodeResponse;

        // Fetching verification code pause_window
        var pauseWindow = this.pwdCommonUtils.getVerificationParam(verificationId,
            this.CONSTANTS.PAUSE_WINDOW.PARAM_NAME,
            this.CONSTANTS.PAUSE_WINDOW.PROPERTY_NAME,
            this.CONSTANTS.PAUSE_WINDOW.DEFAULT_VALUE
        );
        uxfResponse.pauseWindow = Number(pauseWindow) * 60 + "";
        return uxfResponse;
    },

    _validateTokenAndGetUserReqData: function(token) {
        var data = {};
        // Validating token
        data.tokenValidationResult = this.pwdResetUxfUtil.getSecurityValidationResult(token);
        if (!data.tokenValidationResult.isValid) return data;

        // Fetch user-request details
        data.userRequestDetails = this.pwdCommonUtils.getUserRequestDetails();
        return data;
    },

    _replaceCharWithMask: function(phoneNumber, char, maskChar) {
        return phoneNumber.replaceAll(char, maskChar);
    },

    type: 'PwdResetUXFSMSVerificationProcessor'
};

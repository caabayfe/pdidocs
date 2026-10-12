var PwdResetUXFSuccessProcessor = Class.create();
PwdResetUXFSuccessProcessor.prototype = {
    initialize: function() {
        this.PASSWORD_REQUEST_SUCCESS_STATUS = "1";
        this.PASSWORD_REQUEST_URL_PENDING_STATUS = "5";
        this.REQUEST_TABLE = "pwd_reset_request";
        this.STATUS_FIELD = "status";
    },

    getPasswordToDisplay: function(token, password, isDisplayPassword) {
        var data = new PwdResetUXFUtil().getSecurityValidationResult(token);
        if (!data.isValid) {
            return data;
        }
        if (!this.isRequestStatusSuccessOrURLPending()) {
            data.isValid = false;
            data.errorMessage =  gs.getMessage("Technical error has occured, try again!");
            return data;
        }

        if (isDisplayPassword) {
            var response = new global.PwdResetStageHandler().getPasswordWithPhonetics(password);
            if (gs.nil(response.password)) {
                return data;
            }
            var phoneticPassword = response.phoneticPassword;
            password = response.password + "";
            var htmlPassword = "<div>";
	    htmlPassword += "<ul>";
            for (var i = 0; i < password.length; i++) {
                var key = password[i];
                if (phoneticPassword.hasOwnProperty(key)) {
                    htmlPassword += "<li style=\"color:rgb(var(--now-color--text-tertiary));\">" + phoneticPassword[key] + "</li>";
                }
            }
            htmlPassword += "</ul>";
            htmlPassword += "</div>";
            response.phoneticPassword = htmlPassword;
            data.passwordDetails = response;
        }
        return data;

    },

    isRequestStatusSuccessOrURLPending: function() {
        var isStatusSuccessOrPending = false;
        var userRequestDetails = new global.PwdCommonUtils().getUserRequestDetails();
        var requestGR = new GlideRecord(this.REQUEST_TABLE);
        if (requestGR.get(userRequestDetails.requestId)) {
            var status = requestGR.getValue(this.STATUS_FIELD);
            isStatusSuccessOrPending = (status === this.PASSWORD_REQUEST_SUCCESS_STATUS) || (status === this.PASSWORD_REQUEST_URL_PENDING_STATUS);
        }
        return isStatusSuccessOrPending;
    },

    type: 'PwdResetUXFSuccessProcessor'
};

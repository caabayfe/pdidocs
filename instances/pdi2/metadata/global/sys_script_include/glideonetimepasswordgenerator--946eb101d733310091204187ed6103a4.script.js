var GlideOneTimePasswordGenerator = Class.create();
GlideOneTimePasswordGenerator.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    isPublic: function() {
        return true;
    },

	generateOneTimePassword: function() {
	    var userSysId = GlideSession.get().getProperty("mfa.code.needed.user.id");
		var factor = this.getParameter("sysparm_factor");
	    GlideSession.get().putProperty("authenticator_type", "emailOtp");
	    var result = this.newItem("result");
	    if(GlideStringUtil.nil(userSysId))
	    	result.setAttribute("msg", gs.getMessage("Failed to generate 6-digit verification code. Please contact your administrator to login"));
		var success = false;
        if (factor == "mfa_EMAIL_div")
            success = SNC.MultifactorAuthUtil.generateSecureOneTimePasswordForEmail(userSysId);
        else if (factor == "mfa_SMS_div")
            success = SNC.MultifactorAuthUtil.generateSecureOneTimePasswordForSMS(userSysId);

        if (success) {
            var resend = this.getParameter("sysparm_resend");
            if (resend) {
                SNC.SecurityEventSender.sendMfaGCFEvent("resend_mfa_otp", "true", (factor == "mfa_EMAIL_div") ? "email" : "sms");
            }

            var factorValue = (factor == "mfa_EMAIL_div") ? gs.getMessage("email address") : gs.getMessage("mobile number");
            var validity = new GlideBoundedIntProperty("glide.multifactor.onetime.code.validity", 5, 3, 10).getInt();
            result.setAttribute("msg", gs.getMessage("The 6-digit verification code was sent to your {0} and is valid for the next {1} minutes.", [factorValue, validity]));
        } else {
            result.setAttribute("msg", gs.getMessage("Failed to generate 6-digit verification code. Please contact your administrator to login"));
        }
    },
	
	isMaxRetryReached: function() {
		return GlideSession.get().getProperty("user_mfa_otp_max_retry_reached");
	},

	generateOneTimePasswordForEmailInSetupFlow: function() {
		var userSysId = GlideSession.get().getUID(); //mfa.code.needed.user.id property is not available in Setup flow
		var factor = this.getParameter("sysparm_factor");
		GlideSession.get().putProperty("authenticator_type", "emailOtp");
		var result = this.newItem("result");
		if(GlideStringUtil.nil(userSysId))
			result.setAttribute("msg", gs.getMessage("Failed to generate 6-digit verification code. Please contact your administrator to login"));
		else {
			var success = SNC.MultifactorAuthUtil.generateSecureOneTimePasswordForEmail(userSysId);
			if (success) {
				var resend = this.getParameter("sysparm_resend");
                if (resend) {
                    SNC.SecurityEventSender.sendMfaGCFEvent("resend_mfa_otp", "true", "email");
                }
				var validity = new GlideBoundedIntProperty("glide.multifactor.onetime.code.validity", 5, 3, 10).getInt();
				result.setAttribute("msg", gs.getMessage("The 6-digit verification code was sent to your email address and is valid for the next {0} minutes.", [validity]));
			} else {
				result.setAttribute("msg", gs.getMessage("Failed to generate 6-digit verification code. Please contact your administrator to login"));
			}
		}
	},

	type: 'GlideOneTimePasswordGenerator'
});

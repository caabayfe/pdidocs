var WebAuthenticationAPI = Class.create();
WebAuthenticationAPI.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    initiateAuthentication: function() {
        try {
            return new SNC.GlideAuthenticationFactor("webauthnauthentication").initiateRequest();
        } catch (error) {
            gs.error("Error while initiating web authentication request." + error);
        }
    },
	
	validateAuthenticationResponse: function() {
        try {
			var response = this.getParameter('sysparm_response');
            var result =  new SNC.GlideAuthenticationFactor("webauthnauthentication").validateResponse(response);
			return result;
        } catch (error) {
            gs.error("Error while validating web authentication response." + error);
			return false;
        }
    },
	
	isOtpValid: function() {
        var otp = this.getParameter("sysparm_otp").toString();
        var factorParam = this.getParameter("sysparm_factor");
        var factor = factorParam ? factorParam.toString() : '';
        var result = this.newItem("result");
        if (GlideStringUtil.notNil(otp)) {
            try {
                var isValid = SNC.MultifactorAuthUtil.isOtpValid(otp, factor);
                result.setAttribute("valid", isValid);
            } catch (error) {
                gs.error("Error while validating OTP." + error);
                result.setAttribute("valid", false);
            }
        } else{
			gs.addErrorMessage(gs.getMessage("Your Passcode is incorrect. Please try again with a correct code."));
			result.setAttribute("valid", false);
		}
    },

    isPublic: function() {
        return true;
    },

    type: 'WebAuthenticationAPI'
});

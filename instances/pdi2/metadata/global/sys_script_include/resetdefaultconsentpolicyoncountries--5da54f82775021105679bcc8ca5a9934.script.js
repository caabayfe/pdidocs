var ResetDefaultConsentPolicyOnCountries = Class.create();
ResetDefaultConsentPolicyOnCountries.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    reset: function() {
        // European Countries will be updated to "Explicit Op In" Consent Policy
        // Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary,
        // Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden,
        // United Kingdom, Iceland, Liechtenstein, Norway, Switzerland
        var explicitOptIn = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB", "IS", "LI", "NO", "CH"];

		// United States will be updated to "No Consent Required" Consent Policy
		var noConsentRequired = ["US"];

		// Set ExplicitOptIn consent policy
		var gr = new GlideRecord("core_country");
		gr.addQuery("iso3166_2", "IN", explicitOptIn);
		gr.setValue("analytics_consent_policy", "87f9b519773311105679bcc8ca5a9922");
		gr.updateMultiple();

		// Set NoConsentRequired consent policy
		gr = new GlideRecord("core_country");
		gr.addQuery("iso3166_2", "IN", noConsentRequired);
		gr.setValue("analytics_consent_policy", "ef0bb519773311105679bcc8ca5a99ad");
		gr.updateMultiple();

		// Rest of the Countries will be updated to "Notice" consent policy
		gr = new GlideRecord("core_country");
		gr.addQuery("iso3166_2", "NOT IN", noConsentRequired.concat(explicitOptIn));
		gr.setValue("analytics_consent_policy", "562bf159773311105679bcc8ca5a9983");
		gr.updateMultiple();
		return true;
    },
    
   type: 'ResetDefaultConsentPolicyOnCountries'
});

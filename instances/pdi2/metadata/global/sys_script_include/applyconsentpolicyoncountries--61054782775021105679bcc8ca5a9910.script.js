var ApplyConsentPolicyOnCountries = Class.create();
ApplyConsentPolicyOnCountries.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    apply: function() {
        var policy = this.getParameter("sysparm_policy_sys_id");
        var countryGR = new GlideRecord('core_country');
        countryGR.analytics_consent_policy = policy;
		countryGR.updateMultiple();
		return true;
    },
    
   type: 'ApplyConsentPolicyOnCountries'
});

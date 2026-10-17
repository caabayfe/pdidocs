var DomainSeparationLicensingUtil = Class.create();
DomainSeparationLicensingUtil.prototype = {
    ARTIFACT_ID: "com.glide.domain.msp_extensions.installer_virtual",
    ARTIFACT_TYPE_APP_ID: "app_id",

    initialize: function() {
        this.entitlementAPI = new sn_entitlement.GlideEntitlementAPI();
    },

	/**
    * Checks if the Domain Separation plugin is licensed
    * @returns {boolean} true if the feature is licensed, false otherwise
    */
    hasLicense: function() {
	    if (GlideUtil.isDeveloperInstance() || !this.entitlementAPI.isInstanceLicenseAware()) {
		    return true;
		}
		var response = false;
        try {
            var entitledBO = this.entitlementAPI.getLicenseDetailsForArtifact(this.ARTIFACT_TYPE_APP_ID, this.ARTIFACT_ID);
            response = entitledBO.getIsEntitled();
        } catch (err) {
            gs.error('Received error response from GlideEntitlementAPI.getLicenseDetailsForArtifact. ', err);
        }
        return response;
    },

    type: 'DomainSeparationLicensingUtil'
};

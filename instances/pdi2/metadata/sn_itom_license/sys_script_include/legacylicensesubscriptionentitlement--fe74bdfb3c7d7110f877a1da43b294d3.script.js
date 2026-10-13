var LegacyLicenseSubscriptionEntitlement = Class.create();
LegacyLicenseSubscriptionEntitlement.prototype = Object.extendsObject(sn_itom_licensing.LicenseSubscriptionEntitlement, {
	getItomLegacyLicenseInfo: function() {
		var payload = new sn_entitlement.SubscriptionEntitlementsService().getSubscriptionDetail();
		return JSON.stringify(payload);
    },
    type: 'LegacyLicenseSubscriptionEntitlement'
});

var OTM_SKU = "otm";
var DISCOVERY = "discovery";
var utils = new sn_itom_license.ITOMLicensingUtils();
if (!utils.ignoreITOMDiscovery(OTM_SKU)) {
	var skuGr = new GlideRecord('itom_lu_sku_type');
	skuGr.get(OTM_SKU);
	//clean up existing record for application discovery and sku otm from itom_lu_licensable_cis table
    utils.cleanUpCIListingReport(DISCOVERY, OTM_SKU);
	new global.ITOMVisibilityLicenseCounterV2().calculateLicenseUsage(false, skuGr);
}
utils.setCompletedStatusforListing(DISCOVERY,OTM_SKU);

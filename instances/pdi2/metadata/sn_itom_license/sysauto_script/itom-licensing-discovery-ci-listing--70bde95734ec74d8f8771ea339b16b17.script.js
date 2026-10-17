 var ITOM_SKU = 'itom';
var OTM_SKU = 'otm';
var DISCOVERY = 'discovery';
var utils = new sn_itom_license.ITOMLicensingUtils();
if (!utils.ignoreITOMDiscovery(ITOM_SKU)) {
    var isOTOMPresent = utils.isDiscoveryPresent(OTM_SKU);
    //clean up existing records for application discovery and sku itom from itom_lu_licensable_cis table
    utils.cleanUpCIListingReport(DISCOVERY, ITOM_SKU);
    if (!isOTOMPresent)
		new global.ITOMVisibilityLicenseCounter().calculateUsage(false);
    else {
		var skuGr = new GlideRecord('itom_lu_sku_type');
		skuGr.get(ITOM_SKU);
		new global.ITOMVisibilityLicenseCounterV2().calculateLicenseUsage(false, skuGr);
    }
}
utils.setCompletedStatusforListing(DISCOVERY,ITOM_SKU);

 var utils = new sn_itom_license.ITOMLicensingUtils();
if (utils.ignoreITOMDiscovery('itom')) {
    var isOTOMPresent = utils.isVisibilityPresent('otm');
    var factory = new global.ITOMVisibilityLicenseCounterFactory();
    var helper = factory.getCounter();
    //clean up existing records for application visibility and sku itom from itom_lu_licensable_cis table
    utils.cleanUpCIListingReport('visibility', 'itom');
    if (!isOTOMPresent)
        helper.calculateUsage(false);
    else {
        var skuGr = new GlideRecord('itom_lu_sku_type');
        skuGr.get('itom');
        helper.calculateLicenseUsage(false, skuGr);
    }
}
utils.setCompletedStatusforListing('visibility','itom');

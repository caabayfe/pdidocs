 var utils = new sn_itom_license.ITOMLicensingUtils();
    if (utils.ignoreITOMDiscovery('otm')) {
      var skuGr = new GlideRecord('itom_lu_sku_type');
      skuGr.get('otm');
      //clean up existing records for application visibility and sku otm from itom_lu_licensable_cis table
      utils.cleanUpCIListingReport('visibility', 'otm');
      var factory = new global.ITOMVisibilityLicenseCounterFactory();
      var helper = factory.getCounter();
      helper.calculateLicenseUsage(false, skuGr);
    }
    utils.setCompletedStatusforListing('visibility','otm');

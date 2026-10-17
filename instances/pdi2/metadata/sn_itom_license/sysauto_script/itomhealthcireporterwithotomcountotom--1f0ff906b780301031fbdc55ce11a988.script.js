var utils = new sn_itom_license.ITOMLicensingUtils();
var skuGr = new GlideRecord('itom_lu_sku_type');
skuGr.get('otm');
//clean up existing records for application health and sku itom from itom_lu_licensable_cis table
utils.cleanUpCIListingReport('health', 'otm');
new global.HealthLicenseReportPopulatorWithOTOM().populateReportTable(skuGr);
utils.setCompletedStatusforListing('health','otm');

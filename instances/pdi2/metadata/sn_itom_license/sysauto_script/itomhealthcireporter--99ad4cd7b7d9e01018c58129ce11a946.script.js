

var utils = new sn_itom_license.ITOMLicensingUtils();
//clean up existing records for application health and sku itom from itom_lu_licensable_cis table
utils.cleanUpCIListingReport('health');
if(!utils.isHealthPresent('otm')) 
	new global.HealthLicenseReportPopulator().populateReportTable();
else {
    var skuGr = new GlideRecord('itom_lu_sku_type');
	skuGr.get('itom');
	new global.HealthLicenseReportPopulatorWithOTOM().populateReportTable(skuGr);
}
utils.setCompletedStatusforListing('health','itom');

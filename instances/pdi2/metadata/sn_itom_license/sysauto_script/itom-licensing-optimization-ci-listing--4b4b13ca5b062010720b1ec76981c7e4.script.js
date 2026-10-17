var utils = new sn_itom_license.ITOMLicensingUtils();
//clean up existing records for application optimization and sku itom from itom_lu_licensable_cis table
utils.cleanUpCIListingReport('optimization');
new global.PopulateCMPCIForLicensing().execute(true);
utils.setCompletedStatusforListing('optimization');

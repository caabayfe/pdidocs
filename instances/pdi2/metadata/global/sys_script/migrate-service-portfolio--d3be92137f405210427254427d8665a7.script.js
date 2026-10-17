(function executeRule(current, previous /*null when async*/ ) {
	var utils = new SPMTaxonomyUtils();
	utils.migratePortfolio(current.getValue('spm_service_portfolio'), current.getUniqueValue());
})(current, previous);

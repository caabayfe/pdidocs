(function refineQuery(current, parent) {

	var configHubUtil = new ConfigurationHubUtil();
	// Add your code here, such as current.addQuery(field, value);
	var parentProductId = parent.getValue('sys_id');
	var packages = configHubUtil.getProductApplications(parentProductId);
	current.addQuery('origin_scope', 'IN', packages.map((package) => package.id).join());

})(current, parent);

(function refineQuery(current, parent) {
	var appScopeId;
	if ("sys_store_app" == parent.getTableName())
		appScopeId = parent.sys_id;
	else
		appScopeId = parent.vendor_app;
	
	modifiedFiles = sn_app_customization.AppCustomizationAPI.getAppCustomizationFiles(appScopeId);
	current.addQuery("sys_scope", appScopeId);
	current.addQuery("sys_update_name", "IN", modifiedFiles);
})(current, parent);

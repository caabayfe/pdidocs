answer = (function() {
	if (gs.hasRole('admin'))
		return true;
	var sysStoreAppGr = new GlideRecord('sys_store_app');
	var currentAppId = gs.getCurrentApplicationId();
	sysStoreAppGr.get(currentAppId);
	return (sysStoreAppGr.canWrite() || sn_app_api.AppStoreAPI.canPublishToAppRepo(currentAppId)) && gs.getProperty('sn_appauthor.allow_customization_upload', 'true') == 'true' && sn_app_customization.AppCustomizationAPI.hasAppCustomizationFiles(currentAppId);
})();

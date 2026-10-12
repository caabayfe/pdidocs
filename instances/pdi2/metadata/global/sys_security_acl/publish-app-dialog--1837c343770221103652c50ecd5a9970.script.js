answer = (function() {
	if (gs.hasRole('admin'))
		return true;
	var sysAppGr = new GlideRecord('sys_app');
	var currentAppId = gs.getCurrentApplicationId();
	sysAppGr.get(currentAppId);
	return (GlideUtil.isDeveloperInstance() || sysAppGr.getValue('vendor') != 'ServiceNow') && (sysAppGr.canWrite() || sn_app_api.AppStoreAPI.canPublishToUpdateSet(currentAppId)) && (gs.getProperty('glide.update_set.publish.ui', 'true') == 'true');
})();

(function executeRule(current, previous /*null when async*/) {
	var appId = current.getValue('sys_id');
	
	if ((current.canWrite() || sn_app_api.AppStoreAPI.canPublishToAppRepo(current.sys_id)) && gs.getProperty('sn_appauthor.allow_customization_upload', 'true') == 'true'  && sn_app_customization.AppCustomizationAPI.hasAppCustomizationFiles(appId))
		g_scratchpad.showCustomizationInfo = true;
	
	g_scratchpad.customizationInfoMessage = gs.getMessage('inform_user_about_ability_to_deploy_customizations');

})(current, previous);

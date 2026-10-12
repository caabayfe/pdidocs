(function executeRule(current, previous /*null when async*/) {
	var appId = current.getValue('application');
  var ck_token =  gs.getSession().getSessionToken();
	
	if (sn_app_customization.AppCustomizationAPI.isAppCustomizationCapableById(appId))
		g_scratchpad.showCustomizationInfo = true;
	
	g_scratchpad.customizationInfoMessage = gs.getMessage('inform_user_about_ability_to_deploy_customizations_with_app_link', [appId, ck_token]);

})(current, previous);

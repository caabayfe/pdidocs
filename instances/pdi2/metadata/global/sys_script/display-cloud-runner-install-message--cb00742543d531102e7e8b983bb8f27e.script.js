(function executeRule(current, previous /*null when async*/) {

	// Disable Run in Cloud if store app is not installed but allow unchecking if already checked
	var isCloudRunnerInstalled = pm.isActive('sn_atf_tg') == true;
	var storeUrl = ATFUtil.getTestGeneratorAndCloudRunnerAppStorePageUrl();
	// Used to allow unchecking if the 'Run in cloud' field is checked but Cloud Runner is not available
	var isRunInCloudChecked = !current.isNewRecord() && (current.run_in_cloud == true);
	g_scratchpad.disableRunInCloud = !isCloudRunnerInstalled  && !isRunInCloudChecked;

	if (!isCloudRunnerInstalled)
		gs.addInfoMessage(gs.getMessage('ATF_TG:install_app', 'href="' + storeUrl + '" style="display: contents;" target="_blank"'));

})(current, previous);

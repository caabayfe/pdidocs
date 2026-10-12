(function executeRule(current, previous /*null when async*/) {
	if (current.getValue("before") == "0")
		return;
	
	var appId = gs.getCurrentApplicationId();
	if (sn_app_customization.AppCustomizationAPI.isAppCustomizationCapableById(appId)) {
		gs.addErrorMessage(gs.getMessage("Creation of before fix scripts for third party applications is not supported."));
		current.setAbortAction(true);
	}

})(current, previous);

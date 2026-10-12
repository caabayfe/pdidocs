(function executeRule(current, previous /*null when async*/) {
	if (sn_app_customization.AppCustomizationAPI.isAppCustomizationCapableByScopeName(current.scope)) {
		g_scratchpad.isAppCustomizationCapable = true;
	} else {
		g_scratchpad.isAppCustomizationCapable = false;
	}
})(current, previous);

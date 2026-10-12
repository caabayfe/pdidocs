function transform(input) {
	var apiUtils = new sn_upgrade_mgmt.StoreAppsFlowUtils();
	
	// Get upgrade session ID from input state or query for active session
	var upgradeSessionId = null;
	if (input && input.state && input.state.upgrade_session_id) {
		upgradeSessionId = input.state.upgrade_session_id;
	} else {
		// Query for the most recent active upgrade session
		var grSession = new GlideRecord("sn_um_upgrade_sessions");
		grSession.addQuery("status", "in_progress");
		grSession.orderByDesc("sys_created_on");
		grSession.setLimit(1);
		grSession.query();
		if (grSession.next()) {
			upgradeSessionId = grSession.getValue("sys_id");
			gs.info("Found active upgrade session: " + upgradeSessionId);
		}
	}
	
	// Get suite versions filtered by platform version
	var result = apiUtils.getAvailableSuiteVersions(upgradeSessionId);
	
	// Transform to dropdown format with id and label
	var dropdownItems = [];
	
	if (result && result.suiteVersions) {
		dropdownItems = result.suiteVersions.map(function(suite) {
			return {
				id: suite.version,
				label: suite.version + (suite.installed ? ' (Installed)' : ''),
				installed: suite.installed,
				platform: suite.platform
			};
		});
	}
	// Check if suite versions exist
	var hasSuiteVersions = dropdownItems && dropdownItems.length > 0;
	// Return result with dropdown items and default selection
	return {
		items: dropdownItems,
		defaultValue: result ? result.defaultVersion : null,
		installedVersion: result && result.installedVersion ? result.installedVersion.version : null,
		hasSuiteVersions: hasSuiteVersions 
	};
}

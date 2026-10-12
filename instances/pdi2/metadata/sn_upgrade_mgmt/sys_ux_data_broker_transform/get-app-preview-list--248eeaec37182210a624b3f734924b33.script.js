function transform(input) {
	var target_patch_id = input.target_patch_id; 
	var upgrade_plan_sysid = input.upgrade_plan_sysid;
	var upgrade_preview_sysid = input.upgrade_preview_sysid;
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
		}
	}
	var splitResult = apiUtils.getPreviewAppListWithSplit(target_patch_id, upgrade_plan_sysid, upgrade_preview_sysid, upgradeSessionId);
	var suiteVersions = splitResult.suiteVersions || [];
	var suiteConfigMaps = {};
	for (var i = 0; i < suiteVersions.length; i++) {
		var suiteVersion = suiteVersions[i];
		var suiteAppsMap = apiUtils._loadSuiteConfigApps(suiteVersion.sys_id, suiteVersion.version);
		suiteConfigMaps[suiteVersion.version] = suiteAppsMap;
	}
	return {
		goldenConfigApps: splitResult.goldenConfigApps,
		regularApps: splitResult.regularApps,
		allApps: splitResult.allApps,
		suiteVersions: splitResult.suiteVersions,
		suiteConfigMaps: suiteConfigMaps,
		selectedSuite: splitResult.selectedSuite,
		latestSuite: splitResult.latestSuite
	};
}

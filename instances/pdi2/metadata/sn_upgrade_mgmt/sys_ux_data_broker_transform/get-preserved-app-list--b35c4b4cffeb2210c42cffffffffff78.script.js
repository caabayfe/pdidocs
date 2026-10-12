function transform(input) {
	var apiUtils = new sn_upgrade_mgmt.StoreAppsFlowUtils();
	
	// Optional: Get upgradeSessionId from input if available
	var upgradeSessionId = input.upgradeSessionId;
	var selectedSuiteVersion = input.selectedSuiteVersion;
	
	// Get split preserved apps (golden config and regular)
	var splitResult = apiUtils.getPreservedAppListWithSplit(upgradeSessionId, selectedSuiteVersion);
	
	// Return structure with both app types and suite metadata
	return {
		goldenConfigApps: splitResult.goldenConfigApps,
		regularApps: splitResult.regularApps,
		allApps: splitResult.allApps,
		suiteVersions: splitResult.suiteVersions,
		selectedSuite: splitResult.selectedSuite,
		latestSuite: splitResult.latestSuite,
		installedSuite: splitResult.installedSuite
	};
}

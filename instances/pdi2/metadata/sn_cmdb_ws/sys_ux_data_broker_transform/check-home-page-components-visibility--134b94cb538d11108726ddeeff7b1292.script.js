function transform(input) {
	var util = new sn_cmdb_ws.CMDBWorkspaceUtil();
	var insightUtil = new sn_cmdb_ws.CMDBWsInsightUtil();
	return {
		showCIsManagedByMe: util.showCIsManagedByMe(),
		showTotalCIs: util.showTotalCIs(),
		showImportantActions: util.showImportantActions(),
		showCloudNonCloudAsset: insightUtil.showCloudVsNonCloudAsset(),
		showCloudVsNonCloudStatusContainer: insightUtil.showCloudVsNonCloudStatusContainer(),
		showAdvisorEntryPoint: sn_cmdb_ws.CMDBWsAdvisorUtil.showHomePageEntryPoint()
	};
}

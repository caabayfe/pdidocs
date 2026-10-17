function transform() {
	var util = new sn_cmdb_ws.CMDBWorkspaceUtil();
	return {
		showCmbdPerformance: util.showCmdbPerformance(),
		showSGGTab: util.showPerformanceInsightSGCTab()
	};
}

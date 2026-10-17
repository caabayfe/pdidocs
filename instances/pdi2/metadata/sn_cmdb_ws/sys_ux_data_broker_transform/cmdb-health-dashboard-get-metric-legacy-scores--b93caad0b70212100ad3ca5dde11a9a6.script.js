function transform(input) {

	var util = new sn_cmdb_ws.CMDBWsHealthDashboardLegacyUtil();
	var metricScore = input.metricScore;
	return util.getLegacyScore(metricScore);

}

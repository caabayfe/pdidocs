function transform(input) {
	var insightUtil = new sn_cmdb_ws.CMDBWsInsightUtil();
	return insightUtil.buildResultTablePrimaryCiMap();
}

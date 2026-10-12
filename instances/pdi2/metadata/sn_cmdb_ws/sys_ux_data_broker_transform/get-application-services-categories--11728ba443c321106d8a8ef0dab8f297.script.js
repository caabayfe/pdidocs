function transform(input) {
	var insight = new sn_cmdb_ws.CMDBWsInsightUtil();
	var tabDetails = insight.getAppSvcTabs();
	
	return tabDetails;
}

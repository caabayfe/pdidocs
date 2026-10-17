function transform(input) {

	var enabled = input.enabled;
	var util = new sn_cmdb_ws.CMDBWsHealthDashboardLegacyUtil();
	util.updateLegacyScoreProperty(enabled);
	return enabled;
	
}

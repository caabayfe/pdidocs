function transform(input) {
	var uiProxy = new CMDBWsDMCertDashboardUIProxy();
	var result = {};
	if (!input.sysId)
		return result;

	var instanceId = input.sysId;
	var wrapperFunction = function() {
		return uiProxy.getCertRecordsListDetails(instanceId);
	};

	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Certification - Get Records List information", wrapperFunction);
}

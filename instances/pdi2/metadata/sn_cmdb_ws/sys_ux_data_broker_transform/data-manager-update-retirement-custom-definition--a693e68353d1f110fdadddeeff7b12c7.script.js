function transform(input) {
	var wrapperFn = function() {
		var payload = input.payload;
		var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
		proxy.updateRetirementCustomDefinition(payload.definitionId, payload.tableName, payload.queryCondition, payload.activeFlag);
	};

	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager Update Retirement Custom Definition", wrapperFn);
}

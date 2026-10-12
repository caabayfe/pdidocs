function transform(input) {
	var wrapperFn = function() {
		var payload = input.payload;
		var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
		var definitionId = proxy.addRetirementCustomDefinition(payload.tableName, payload.queryCondition, payload.activeFlag);

		return {
			definitionId: definitionId
		};
	};

	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager Create Retirement Custom Definition", wrapperFn);
}

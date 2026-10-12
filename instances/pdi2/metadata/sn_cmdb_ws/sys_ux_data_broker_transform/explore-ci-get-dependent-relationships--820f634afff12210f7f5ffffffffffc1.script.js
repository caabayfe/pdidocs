function transform(input) {
	const { table, sysId, dependencies } = input;
	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_explore_ci", "Get dependent relationships", function() {
		const exploreCIService = new sn_cmdb_ws.CMDBWsExploreCIService();
		return exploreCIService.getDependentRelationships(table, sysId, dependencies);
	});
}

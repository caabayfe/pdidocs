function transform(input) {
	const { table, sysId, fields, dependencies, bypassIRE } = input;
    
	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_explore_ci", "Update CI record", function() {
        return new sn_cmdb_ws.CMDBWsExploreCIService().updateCI(table, sysId, fields, dependencies, bypassIRE);
    });
}

function transform(input) {
	const {sysId } = input;
    
	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_explore_ci", "Get related items", function() {
        return {
			relatedItems: new sn_cmdb_ws.CMDBWsExploreCIService().getRelatedItems(sysId),
		};
    });
}

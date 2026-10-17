function transform(input) {
	var wrapperFunction = function() {
		var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
		proxy.publishPolicy(input.policyId);
	};
    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager Publish Policy", wrapperFunction);
}

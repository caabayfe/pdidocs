function transform(input) {
	var wrapperFunction = function() {
		var policyTypeSysId = input.policyTypeSysId;
		var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
		return proxy.getSubflows(policyTypeSysId);
	};

	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager Get Available Subflows", wrapperFunction);
}

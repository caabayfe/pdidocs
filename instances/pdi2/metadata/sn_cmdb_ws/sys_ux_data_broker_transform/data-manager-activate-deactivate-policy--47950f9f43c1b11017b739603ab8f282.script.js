function transform(input) {
	var wrapperFunction = function() {
		var sysId = input.policySysId;
		var activateFlag = input.isActivatePolicy;
		var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
		proxy.activatePolicy(sysId, activateFlag);
		var policyData = proxy.getPolicyInfo(sysId);
		return policyData;
	};
    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager Activate/Deactivate Policy", wrapperFunction);
}

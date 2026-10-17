function transform(input) {
	var wrapperFunction = function() {
		var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
		policyReviewData = proxy.getPolicyReviewInfo(input.policySysId);
		return policyReviewData;
	};
	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Get data manager policy review info", wrapperFunction);
}

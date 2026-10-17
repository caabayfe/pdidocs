function transform(input) {
	var wrapperFunction = function() {
		var payload = input.payload;
		var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();

		// format the policy data by using the current view as key and save the data, then query the policy for updates
		var currentViewPolicyData = {};
		currentViewPolicyData[payload.currentView] = payload.policyData[payload.currentView];
		proxy.updatePolicy(payload.policySysId, currentViewPolicyData);
		var policyData = proxy.getPolicyInfo(payload.policySysId);

		// update the updated_on flag for the client display
		var gdt = new GlideDateTime(policyData.updated_on);
		var policyUpdated = gs.getMessage("Last saved: {0}", gdt.getDisplayValue());

		return {
			"policyData": policyData,
			"policyUpdated": policyUpdated
		};
	};
    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager Update Policy", wrapperFunction);
}

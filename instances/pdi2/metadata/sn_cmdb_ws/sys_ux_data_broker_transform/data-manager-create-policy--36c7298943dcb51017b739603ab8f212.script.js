function transform(input) {
	var wrapperFunction = function() {
		var payload = input.payload;
		var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
		var policySysId = proxy.createDraftPolicy(payload.policy_name, payload.description, payload.cmdb_policy_type, payload.work_notes);
		var updatedOn = proxy.getPolicyInfo(policySysId).updated_on;
		var gdt = new GlideDateTime(updatedOn);
		var policyUpdated = gs.getMessage("Last saved: {0}", gdt.getDisplayValue());
		return {
			"policySysId": policySysId,
			"policyUpdated": policyUpdated
		};
	};
    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager Create Policy", wrapperFunction);
}

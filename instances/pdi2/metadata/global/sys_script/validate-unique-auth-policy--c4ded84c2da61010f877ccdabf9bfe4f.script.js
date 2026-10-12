(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('auth_policy_mapping');
	gr.addQuery('inbound_auth_profile', current.inbound_auth_profile);
	gr.addQuery('auth_policy', current.auth_policy);
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('Error: duplicated authentication policy found.'));
		current.setAbortAction(true);
	}
})(current, previous);

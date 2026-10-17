(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_auth_profile_mapping');
	gr.addQuery('inbound_auth_profile', current.inbound_auth_profile);
	gr.addQuery('api_access_policy', current.api_access_policy);
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('Error: duplicated authentication profile found.'));
		current.setAbortAction(true);
	}
})(current, previous);

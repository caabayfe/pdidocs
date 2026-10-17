(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_processor_profile_mapping');
	gr.addQuery('inbound_auth_profile', current.inbound_auth_profile);
	gr.addQuery('sys_processor', current.sys_processor);
	gr.query();
	if (gr.next()) {
		var gr1 = new GlideRecord('sys_processor');
		gr1.get(current.sys_processor);
		var gr2 = new GlideRecord('inbound_auth_profile');
		gr2.get(current.inbound_auth_profile);
		gs.addErrorMessage(gs.getMessage('Error: duplicated profile mapping was found with processor {0} and profile {1}',[gr1.name, gr2.name]));
		current.setAbortAction(true);
	}
})(current, previous);

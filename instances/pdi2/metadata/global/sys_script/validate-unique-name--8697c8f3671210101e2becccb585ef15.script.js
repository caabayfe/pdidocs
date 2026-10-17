(function executeRule(current, previous /*null when async*/) {
	// Add your code here
	var gr = new GlideRecord('inbound_auth_profile');
	gr.addQuery('name', current.name);
	gr.addQuery('sys_scope', current.sys_scope);
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('Error: duplicated profile name is not allowed in same scope .'));
		current.setAbortAction(true);
	}

})(current, previous);

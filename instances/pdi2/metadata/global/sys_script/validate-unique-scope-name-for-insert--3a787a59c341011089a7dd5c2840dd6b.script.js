(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_auth_scope');
	gr.addQuery('name', current.name);
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('Error: duplicated auth scope name found.'));
		current.setAbortAction(true);
	}
})(current, previous);

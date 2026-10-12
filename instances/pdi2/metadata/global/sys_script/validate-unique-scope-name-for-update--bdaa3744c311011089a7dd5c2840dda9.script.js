(function executeRule(current, previous /*null when async*/) {

	if (current.name != previous.name) {
		var gr = new GlideRecord('sys_auth_scope');
		gr.addQuery('name', current.name);
		gr.query();
		if (gr.next()) {
			gs.addErrorMessage(gs.getMessage('Error: duplicated auth scope is not allowed.'));
			current.setAbortAction(true);
		}
	}	

})(current, previous);

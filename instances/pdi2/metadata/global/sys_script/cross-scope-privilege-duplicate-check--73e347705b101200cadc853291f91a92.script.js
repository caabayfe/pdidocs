(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var gr = new GlideRecord('sys_scope_privilege');
	gr.addQuery('source_scope', current.source_scope);
	gr.addQuery('target_scope', current.target_scope);
	gr.addQuery('target_name', current.target_name);
	gr.addQuery('target_type', current.target_type);
	gr.addQuery('operation', current.operation);
	if (previous) {
		gr.addQuery('status', current.status);
	}
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('Cross scope runtime access record already exists'));
		current.setAbortAction(true);
	}

})(current, previous);

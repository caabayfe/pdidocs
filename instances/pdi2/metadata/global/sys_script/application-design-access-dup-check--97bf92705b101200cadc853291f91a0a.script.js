(function executeRule(current, previous /*null when async*/) {
	// Add your code here

	var gr = new GlideRecord('sys_scope_design_access');
	gr.addQuery('source_scope', current.source_scope);
	gr.addQuery('target_package', current.target_package);
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('Design access record already exists'));
		current.setAbortAction(true);
	}
})(current, previous);

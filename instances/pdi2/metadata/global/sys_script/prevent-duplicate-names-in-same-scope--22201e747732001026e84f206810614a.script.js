(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('scan_check_suite');
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.addQuery('sys_scope', current.getValue('sys_scope'));
	gr.addQuery('name', current.getValue('name'));
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage("A suite with that name already exists in this scope"));
		current.setAbortAction(true);
	}
})(current, previous);

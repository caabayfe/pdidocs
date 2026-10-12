(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord(current.getTableName());
	gr.addQuery('name', current.name);
	gr.addQuery('sys_scope', current.sys_scope);
	gr.query();

	if (gr.next() && gr.getUniqueValue() != current.sys_id) {
		var errorMsg = "Another Topic Alias with the same name in the application already exists";
		gs.error(errorMsg + " - Existing record: sys_id=" + gr.getUniqueValue() + ", name='" + gr.name + "', scope=" + gr.sys_scope);
		gs.addErrorMessage(gs.getMessage(errorMsg));
		current.setAbortAction(true);
	}
})(current, previous);

(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("sys_script_vtable");
	gr.addQuery("sys_id", "!=", current.sys_id);
	gr.addQuery("table", current.table);
	gr.addActiveQuery();
	gr.queryNoDomain();
	if (gr.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("There cannot be more than one active Remote Table definition for a table."));
	}

})(current, previous);

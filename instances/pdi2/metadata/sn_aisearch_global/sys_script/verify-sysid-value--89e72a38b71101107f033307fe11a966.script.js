(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord(current.table_name);
	if (!gr.isValid()) {
		gs.addErrorMessage(gs.getMessage("Invalid table name: {0}", current.table_name));
		current.setAbortAction(true);
		return;
	}
	
	if (!gr.get(current.source_sys_id)) {
		gs.addErrorMessage(gs.getMessage("Could not find record with sys_id: {0} in table: {1}", [current.source_sys_id , current.table_name]));
		current.setAbortAction(true);
		return;
	}
		

})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_db_object');
	gr.addQuery('name', current.table);
	gr.query();
	if(!gr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('{0} table does not exist in the instance.', current.table));
	}
})(current, previous);

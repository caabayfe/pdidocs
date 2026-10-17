(function executeRule(current, previous /*null when async*/) {
	if (!current.name.changes())
		return;
	
	var gr = new GlideRecord(current.getTableName());
	gr.addQuery('name', current.getValue('name'));
	gr.query();
	if (gr.hasNext()) {
		gs.addInfoMessage(
			gs.getMessage("Activity Type name should be unique.")
		);
		current.setAbortAction(true);
	}
		
})(current, previous);

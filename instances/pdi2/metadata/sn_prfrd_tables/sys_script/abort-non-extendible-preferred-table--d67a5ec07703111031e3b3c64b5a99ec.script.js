(function executeRule(current, previous /*null when async*/) {
	if (current.context.name == 'Extension') {
		var gr = new GlideRecord('sys_db_object');
		gr.addQuery('name', current.preferred_table.table);
		gr.addQuery('is_extendable', 'true');
		gr.query();
		if(!gr.hasNext()) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Non extendible table is selected with context Extension.'));
		}
	}
})(current, previous);

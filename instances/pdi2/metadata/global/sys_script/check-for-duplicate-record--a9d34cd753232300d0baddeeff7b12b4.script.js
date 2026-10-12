(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('ts_configuration');
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	if (!gs.nil(current.table))
		gr.addQuery('table', current.table);
	else
		gr.addQuery('index_group', current.index_group);
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage("An existing record found for the same table or index group"));
		current.setAbortAction(true);
	}
})(current, previous);

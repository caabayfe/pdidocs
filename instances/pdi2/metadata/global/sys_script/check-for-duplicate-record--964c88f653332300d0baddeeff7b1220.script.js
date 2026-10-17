(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('ts_column_attribute_map');
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.addQuery('ts_configuration', current.getValue('ts_configuration'));
	gr.addQuery('table', current.getValue('table'));
	gr.addQuery('name', current.getValue('name'));
	gr.addQuery('column', current.getValue('column'));
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage("An existing record found for the same table, column and attribute"));
		current.setAbortAction(true);
	}
})(current, previous);

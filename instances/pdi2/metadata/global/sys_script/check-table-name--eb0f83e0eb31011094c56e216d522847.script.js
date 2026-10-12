(function executeRule(current, previous /*null when async*/) {

	var tableName = current.table;
	
	var gr = new GlideRecord('protected_table_configuration');
    gr.addQuery('sys_id', '!=', current.sys_id);
	gr.addQuery('table', tableName);
    gr.setLimit(1);
    gr.query();
    if (gr.next()) {
		gs.addErrorMessage(gs.getMessage("A configuration already exists for the table '{0}'. If you need to adjust the protections on this table, modify the record by <a target='_blank' href='{1}'>clicking here.</a>", [tableName, gr.getLink(true)]));
        current.setAbortAction(true);
	}
})(current, previous);

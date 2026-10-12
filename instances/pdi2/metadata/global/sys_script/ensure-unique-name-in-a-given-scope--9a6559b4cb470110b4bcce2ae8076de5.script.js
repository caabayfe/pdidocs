(function executeRule(current, previous /*null when async*/ ) {

	// Check if a Decision record with the given name exists in the current scope
    var gr = new GlideRecord(current.getTableName());
    gr.addQuery('sys_id', '!=', current.sys_id.toString());
	gr.addQuery('sys_scope', current.sys_scope);
    gr.addQuery('name', current.name);
    gr.query();

    if (gr.hasNext()) {
        gs.addErrorMessage(gs.getMessage('Decision record with name "{0}" already exists.', GlideStringUtil.escapeHTML(current.name)));
        current.setAbortAction(true);
    }

})(current, previous);

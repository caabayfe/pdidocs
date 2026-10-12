(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('quickactions_action');
	gr.addQuery('command_name', current.command_name);
	gr.addQuery('sys_scope', current.sys_scope);
	gr.addQuery('table_name', current.table_name);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.query();
	while(gr.next()) {
		if(!current.sys_overrides || !(gr.getValue('sys_id') == current.sys_overrides && !current.active)) {
			gs.addErrorMessage(gs.getMessage('command name {0} already exists in the scope for the target table', current.command_name));
			current.setAbortAction(true);
			break;
		}
	}

})(current, previous);

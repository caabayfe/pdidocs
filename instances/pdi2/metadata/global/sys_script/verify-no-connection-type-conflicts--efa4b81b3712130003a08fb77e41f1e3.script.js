(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_connection');
	gr.addQuery('connection_alias', current.sys_id);
	gr.addActiveQuery();
	gr.addEncodedQuery('sys_class_name!='+current.connection_type);
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('Error: Alias Connection Type must match type of all related active Connections'));
		current.setAbortAction(true);
	}

})(current, previous);

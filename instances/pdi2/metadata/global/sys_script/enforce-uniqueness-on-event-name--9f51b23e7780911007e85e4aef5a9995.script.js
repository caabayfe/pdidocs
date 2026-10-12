(function executeRule(current, previous /*null when async*/) {
	var eventName = current.event_name;
	var scope = current.sys_scope.source;
	var gr = new GlideRecord('sys_ux_event');
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.addQuery('sys_scope', current.sys_scope);
	gr.addQuery('event_name', eventName);
	if (gr.operation() != 'insert')
		gr.addQuery('sys_id', '!=', current.sys_id);
	gr.query();
	if (gr.getRowCount() > 0) {
		gs.addErrorMessage(gs.getMessage('Duplicate Event Name: {0} in Scope: {1}',[eventName,scope]));
		current.setAbortAction(true);
		return;
	}
})(current, previous);

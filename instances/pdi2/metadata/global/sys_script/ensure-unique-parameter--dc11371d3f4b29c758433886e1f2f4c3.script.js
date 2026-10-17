(function executeRule(current, previous /*null when async*/) {
	if (gs.nil(current.parameter))
		return;

	var gr = new GlideRecord('ais_request_parameter');
	gr.addQuery('parameter', current.parameter);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.query();
	if (gr.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('A request parameter with this name already exists'));
	}
})(current, previous);

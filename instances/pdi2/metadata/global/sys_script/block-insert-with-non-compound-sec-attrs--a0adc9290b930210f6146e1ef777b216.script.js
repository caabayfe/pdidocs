(function executeRule(current, previous) {

	var gr = new GlideRecord('sys_security_attribute');
	if (!gr.get(current.security_attribute)) {
		gs.addErrorMessage(gs.getMessage('Select a valid security attribute to insert/update this data filter.'));
		current.setAbortAction(true);
		return;
	}

	if (gr.getValue('type') == 'compound')
		return;

	gs.addErrorMessage(gs.getMessage('Only compound security attributes can be used with Data Filters. Select a compound security attribute to insert/update this data filter.'));
	current.setAbortAction(true);
})(current, previous);

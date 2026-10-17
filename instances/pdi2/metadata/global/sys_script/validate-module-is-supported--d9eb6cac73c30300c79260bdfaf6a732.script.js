(function executeRule(current, previous /*null when async*/) {

	// Validates that the selected module is supported
	var msg = '';
	var mod = current.inputs.module;
	if (mod.link_type == 'DOC_LINK')
		msg = gs.getMessage('Modules that link to the ServiceNow documentation website are not supported');
	else if (mod.link_type == 'SEPARATOR')
		msg = gs.getMessage("Cannot navigate to a 'Separator' module");
	else if (mod.link_type == 'DIRECT') {
		var modQuery = mod.query + '';
		if (modQuery) {
			modQuery = modQuery.toLowerCase();
			if (modQuery.startsWith('http://') || modQuery.startsWith('https://'))
				msg = gs.getMessage('Modules that link to external websites are not supported');
			else if (modQuery.startsWith('javascript:'))
				msg = gs.getMessage('Modules that execute client-side JavaScript are not supported');
		}
	}

	if (msg != '') {
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
	}
})(current, previous);

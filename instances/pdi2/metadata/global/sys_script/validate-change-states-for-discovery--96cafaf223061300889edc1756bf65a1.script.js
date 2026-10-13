(function executeRule(current, previous /*null when async*/) {
	var triggerValue = current.getValue('value');
	var manualStates = gs.getProperty('com.snc.change_request.disco.manual.state', '');
	var autoStates = gs.getProperty('com.snc.change_request.disco.auto.state', '');
	var invalidStates = false;

	//Check states for manual
	if (triggerValue !== 'automatic' && manualStates === '') {
		invalidStates = true;
		gs.addErrorMessage(gs.getMessage('Change Request states need to be defined to manually trigger Discovery'));
	}

	//Check states for automatic
	if (triggerValue !== 'manual' && autoStates === '') {
		invalidStates = true;
		gs.addErrorMessage(gs.getMessage('Change Request states need to be defined to automatically trigger Discovery'));
	}

	if (invalidStates)
		current.setAbortAction(true);

})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	if (!current.notify_group && !current.conference_provider) {
		gs.addErrorMessage(gs.getMessage('Empty values in the choice.'));
		current.setAbortAction(true);
		return;
	}
	if (current.notify_group && current.conference_provider) {
		gs.addErrorMessage(gs.getMessage('Please configure either Notify group or Conference provider in a choice.'));
		current.setAbortAction(true);
	}
})(current, previous);

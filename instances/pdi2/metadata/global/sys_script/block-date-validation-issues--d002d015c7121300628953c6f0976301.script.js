(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage('End date must be after or equal to begin date'));
	current.setAbortAction(true);

})(current, previous);

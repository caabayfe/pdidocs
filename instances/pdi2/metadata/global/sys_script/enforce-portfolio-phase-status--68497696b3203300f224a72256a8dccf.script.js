(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage('Service status must be selected when phase is selected'));
	current.setAbortAction(true);

})(current, previous);

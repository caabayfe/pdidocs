(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("On hold reason is mandatory when a Change Request is on hold"));
	// Abort the modification
	current.setAbortAction(true);
})(current, previous);

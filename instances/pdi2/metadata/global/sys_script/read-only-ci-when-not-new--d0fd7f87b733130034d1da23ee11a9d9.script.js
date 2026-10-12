(function executeRule(current, previous /*null when async*/) {
	// Abort the modification
	gs.addErrorMessage(gs.getMessage("Configuration item cannot change for in-progress changes"));
	current.setAbortAction(true);
})(current, previous);

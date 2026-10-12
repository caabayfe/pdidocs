(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("Type cannot be changed to standard for Change Requests"));
	
	// Abort the modification
	current.setAbortAction(true);
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("Assignment group is mandatory for in-progress Change Requests"));
	
	// Abort the modification
	current.setAbortAction(true);
})(current, previous);

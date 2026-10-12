(function executeRule(current, previous /*null when async*/ ) {
	gs.addErrorMessage(gs.getMessage("Change model cannot be modified for in progress Change Requests"));
	current.setAbortAction(true);
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("IP address range 'ALL' cannot be altered"));
	current.setAbortAction(true);
})(current, previous);

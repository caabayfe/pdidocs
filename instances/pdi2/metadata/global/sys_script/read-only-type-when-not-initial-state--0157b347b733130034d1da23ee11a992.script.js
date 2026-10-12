(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("Type is read only for in-progress Change Requests"));
	current.setAbortAction(true);
})(current, previous);

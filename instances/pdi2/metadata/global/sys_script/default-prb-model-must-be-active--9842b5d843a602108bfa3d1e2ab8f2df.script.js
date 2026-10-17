(function executeRule(current, previous /*null when async*/) {

	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("A default Problem model must be active"));

})(current, previous);

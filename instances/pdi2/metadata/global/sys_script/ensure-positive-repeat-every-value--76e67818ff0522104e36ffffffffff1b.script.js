(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("Any defined value for Repeat every must be greater than 0"));
	current.setAbortAction(true);
})(current, previous);

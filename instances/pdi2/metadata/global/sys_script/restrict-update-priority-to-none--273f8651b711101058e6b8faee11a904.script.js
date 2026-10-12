(function executeRule(current, previous /*null when async*/) {
	var message = gs.getMessage("None is not a valid selection for Priority.");
	gs.addErrorMessage(message);
	current.setAbortAction(true);
})(current, previous);

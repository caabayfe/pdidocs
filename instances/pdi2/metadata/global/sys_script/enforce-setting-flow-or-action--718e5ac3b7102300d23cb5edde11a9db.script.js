(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("Cannot set both flow and action at the same time"));
	current.setAbortAction(true);

})(current, previous);

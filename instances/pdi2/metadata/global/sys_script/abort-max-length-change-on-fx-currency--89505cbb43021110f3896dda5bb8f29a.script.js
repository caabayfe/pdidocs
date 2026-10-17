(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("Max length for FX Currency must not be less than 32"));
	current.setAbortAction(true);

})(current, previous);

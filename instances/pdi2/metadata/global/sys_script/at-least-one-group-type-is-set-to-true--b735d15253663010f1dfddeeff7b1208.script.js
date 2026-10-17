(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("At least one correlation group type must be set to true"));
	current.setAbortAction(true);

})(current, previous);

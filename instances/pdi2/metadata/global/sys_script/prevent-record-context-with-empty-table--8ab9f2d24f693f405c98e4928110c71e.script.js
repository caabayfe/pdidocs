(function executeRule(current, previous /*null when async*/) {

	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("A function with Record context must have a table defined."));

})(current, previous);

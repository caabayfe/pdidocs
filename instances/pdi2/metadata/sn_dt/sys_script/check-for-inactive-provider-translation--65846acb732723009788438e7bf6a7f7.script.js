(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("Default translator for translation cannot be inactive"));
	current.setAbortAction(true);
	
})(current, previous);

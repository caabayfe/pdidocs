(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("Default translator for translation cannot have an empty translate subflow"));
	current.setAbortAction(true);
	
})(current, previous);

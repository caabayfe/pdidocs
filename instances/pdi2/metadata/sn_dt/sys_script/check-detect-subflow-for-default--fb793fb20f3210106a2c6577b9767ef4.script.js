(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("Default translator for detection cannot have an empty detect subflow"));
	current.setAbortAction(true);
	
})(current, previous);

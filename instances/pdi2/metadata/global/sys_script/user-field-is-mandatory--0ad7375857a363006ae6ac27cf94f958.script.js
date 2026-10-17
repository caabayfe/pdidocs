(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("User field is mandatory"));
	current.setAbortAction(true);
	
})(current, previous);

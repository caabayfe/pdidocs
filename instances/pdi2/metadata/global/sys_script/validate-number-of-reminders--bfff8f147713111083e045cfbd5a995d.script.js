(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("Number of reminders should be greater than or equal to zero"));
	current.setAbortAction(true);

})(current, previous);

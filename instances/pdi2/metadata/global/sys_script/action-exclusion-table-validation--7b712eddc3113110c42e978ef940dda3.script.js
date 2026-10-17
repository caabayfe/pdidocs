(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("Must select one of the table options"));
	current.setAbortAction(true);
})(current, previous);

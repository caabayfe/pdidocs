(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("You can't delete My items item from Menu"));
	current.setAbortAction(true)
})(current, previous);

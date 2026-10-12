(function executeRule(current, previous /*null when async*/ ) {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("Content can not be associated to the same topic more than once."));
})(current, previous);

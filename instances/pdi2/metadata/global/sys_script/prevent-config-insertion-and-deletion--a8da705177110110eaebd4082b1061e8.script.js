(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("Protected Table Configurations cannot be inserted or deleted."));
	current.setAbortAction(true);

})(current, previous);

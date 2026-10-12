(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("Configuration type cannot be updated in parent table."));
	current.setAbortAction(true);
})(current, previous);

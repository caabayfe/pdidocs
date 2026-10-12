(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("Cannot delete choice list options for interaction state."));
	current.setAbortAction(true);
})(current, previous);

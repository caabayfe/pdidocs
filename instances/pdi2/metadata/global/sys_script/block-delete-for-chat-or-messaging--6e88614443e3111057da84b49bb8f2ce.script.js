(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("Cannot delete chat or messaging interaction type values."));
	current.setAbortAction(true);
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("You can't delete a setup topic from default chat experience."));
})(current, previous);

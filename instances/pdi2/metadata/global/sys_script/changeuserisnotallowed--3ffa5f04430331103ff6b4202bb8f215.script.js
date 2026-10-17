(function executeRule(current, previous /*null when async*/) {

	if (current.user != previous.user) {
		gs.addErrorMessage(gs.getMessage("Re-assign user to token is not allowed!"));
		current.setAbortAction(true);
	}
})(current, previous);

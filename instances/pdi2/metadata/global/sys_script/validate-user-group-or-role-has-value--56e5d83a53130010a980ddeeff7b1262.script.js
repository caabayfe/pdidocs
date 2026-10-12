(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("User, Group and Role should not be empty"));
	current.setAbortAction(true);
	action.setRedirectURL(current);
})(current, previous);

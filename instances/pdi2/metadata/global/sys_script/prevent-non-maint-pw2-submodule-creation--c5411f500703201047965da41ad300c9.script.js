(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("You are not authorized to create Password2 Crypto modules"));
	current.setAbortAction(true);
})(current, previous);

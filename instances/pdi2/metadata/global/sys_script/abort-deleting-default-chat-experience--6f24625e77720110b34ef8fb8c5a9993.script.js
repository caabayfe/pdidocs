(function executeRule(current, previous /*null when async*/) {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("You can't delete Default chat experience from Custom Greetings and Setup."));
})(current, previous);

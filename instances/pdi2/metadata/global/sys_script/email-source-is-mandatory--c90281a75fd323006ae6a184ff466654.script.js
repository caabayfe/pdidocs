(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("Email source is mandatory"));
	current.setAbortAction(true);

})(current, previous);

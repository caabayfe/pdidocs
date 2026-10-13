(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("Phone number source is mandatory"));
	current.setAbortAction(true);

})(current, previous);

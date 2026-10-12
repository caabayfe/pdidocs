(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("Scripted variable type has value missing. Please enter script value"));
	current.setAbortAction(true);

})(current, previous);

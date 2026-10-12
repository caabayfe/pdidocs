(function executeRule(current, previous /*null when async*/) {
gs.addErrorMessage(gs.getMessage("Platform Host field is empty. Cannot set Architecture Type as Platform Application."));
	current.setAbortAction(true);
	// Add your code here

})(current, previous);

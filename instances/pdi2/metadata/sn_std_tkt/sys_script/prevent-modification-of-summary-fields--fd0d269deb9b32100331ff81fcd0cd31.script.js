(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	gs.addErrorMessage(gs.getMessage("Use the Summary Fields related list to configure summary fields."));
	current.setAbortAction(true);

})(current, previous);

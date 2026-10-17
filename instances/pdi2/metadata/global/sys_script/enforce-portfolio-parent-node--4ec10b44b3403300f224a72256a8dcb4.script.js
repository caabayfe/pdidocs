(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	gs.addErrorMessage(gs.getMessage("The service portfolio defined in this record does not match the the parent node's portfolio"));
	current.setAbortAction(true);
	
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	gs.addWarningMessage(gs.getMessage("Changing the token format from Opaque to JWT is not supported for this OAuth client. Please refer to the documentation for more details."));
	current.setAbortAction(true);
	// Add your code here

})(current, previous);

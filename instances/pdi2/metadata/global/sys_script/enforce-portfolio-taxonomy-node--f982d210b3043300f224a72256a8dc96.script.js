(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("The service portfolio defined in this record does not match the the taxonomy layer's portfolio"));
	current.setAbortAction(true);

})(current, previous);

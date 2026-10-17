(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("Only Workflow is supported for the 2010 version of the SLA engine - you cannot use a Flow<br>Please consider upgrading to the 2011 engine"));
	current.setAbortAction(true);
	gs.setRedirect(current);

})(current, previous);

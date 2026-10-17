(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage('An interaction cannot be set to "Work In Progress" without an assignee. Set the "Assigned To" field, and the state will automatically be set to "Work In Progress."'));

	current.setAbortAction(true);
	
})(current, previous);

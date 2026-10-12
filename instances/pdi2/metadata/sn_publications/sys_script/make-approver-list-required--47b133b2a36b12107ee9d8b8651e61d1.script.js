(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	gs.addErrorMessage(gs.getMessage('Please select at-least one approver for the workflow.'));
	current.setAbortAction(true);

})(current, previous);

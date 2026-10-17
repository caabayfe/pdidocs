(function executeRule(current, previous /* null when async */) {
	// Add your code here
	gs.addErrorMessage(gs.getMessage('Phase start date is invalid or not provided'));
	current.setAbortAction(true);
}(current, previous));

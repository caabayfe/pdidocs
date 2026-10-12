(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	gs.addErrorMessage(gs.getMessage('Please select at-least one recipient list for the publication.'));
	current.setAbortAction(true);
})(current, previous);

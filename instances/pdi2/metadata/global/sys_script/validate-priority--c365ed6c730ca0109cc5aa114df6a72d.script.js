(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	if (parseInt(current.priority) < 1) {
		gs.addErrorMessage(gs.getMessage("Please enter a positive value for priority."));
		current.setAbortAction(true);
	}

})(current, previous);

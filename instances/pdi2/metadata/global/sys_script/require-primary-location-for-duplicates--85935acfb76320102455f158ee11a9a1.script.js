(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage('If this location is marked as a duplicate, primary location field must be filled out'));
	current.setAbortAction(true);

})(current, previous);

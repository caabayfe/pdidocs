(function executeRule(current, previous /*null when async*/) {

	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage('Add a controller or fill in the controller dependencies field.'));

})(current, previous);

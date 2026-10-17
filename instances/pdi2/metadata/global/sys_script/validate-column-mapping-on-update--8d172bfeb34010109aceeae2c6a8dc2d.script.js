(function executeRule(current, previous /*null when async*/) {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage('Update not allowed. You may delete the mapping and create a new mapping'));	
})(current, previous);

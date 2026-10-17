(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("The insert protection for the table 'sysevent' cannot be changed to block."));
	current.setAbortAction(true);

})(current, previous);

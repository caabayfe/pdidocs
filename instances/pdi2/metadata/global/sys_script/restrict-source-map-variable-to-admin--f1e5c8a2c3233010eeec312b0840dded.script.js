(function executeRule(current, previous /*null when async*/) {

	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage('admin role required to {0}.', current.operation()));

})(current, previous);

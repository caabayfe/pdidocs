(function executeRule(current, previous /*null when async*/) {

	var errMsg = gs.getMessage('Cannot set the Run-As field to empty as a non-admin user');
	gs.error(errMsg);
	gs.addErrorMessage(errMsg);
	current.setAbortAction(true);

})(current, previous);

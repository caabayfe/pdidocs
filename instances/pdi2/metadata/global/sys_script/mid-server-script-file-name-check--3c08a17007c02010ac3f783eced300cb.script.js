(function executeRule(current, previous /*null when async*/) {

	if (current.name.includes("\0")) {
		gs.addErrorMessage(gs.getMessage('Name of script file contains null character'));
		current.setAbortAction(true);
	}
		

})(current, previous);

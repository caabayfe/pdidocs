(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage('Reusable tests cannot be run independently in test suites'));
    current.setAbortAction(true);
})(current, previous);

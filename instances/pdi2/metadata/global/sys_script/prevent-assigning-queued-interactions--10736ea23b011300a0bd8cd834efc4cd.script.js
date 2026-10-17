(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage('An interaction may not be queued if it is already assigned to an agent.'));
	current.setAbortAction(true);
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage('A service offering cannot have a service portfolio or a taxonomy node associated to it.'));
})(current, previous);

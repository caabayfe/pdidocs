(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage('Ensure you properly defined your traversal rule with a rule definition and the feature it is used by.'));
	current.setAbortAction(true);

})(current, previous);

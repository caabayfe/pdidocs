(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage('Ensure you properly defined the rule definition with a relationship type'));
	current.setAbortAction(true);

})(current, previous);

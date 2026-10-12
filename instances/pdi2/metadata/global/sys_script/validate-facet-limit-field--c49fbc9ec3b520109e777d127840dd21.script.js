(function executeRule(current, previous /*null when async*/) {
	if (current.getValue('option_limit') < 0) {
        gs.addErrorMessage(gs.getMessage('Facet Value Limit cannot be a negative number'));
		current.setAbortAction(true);
	}
})(current, previous);

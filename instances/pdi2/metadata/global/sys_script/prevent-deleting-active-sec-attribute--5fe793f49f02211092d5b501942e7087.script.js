(function executeRule(current, previous /*null when async*/) {
	gs.addInfoMessage(gs.getMessage('Active security attribute may not be deleted. Deactivate it first.'));
	current.setAbortAction(true);
})(current, previous);

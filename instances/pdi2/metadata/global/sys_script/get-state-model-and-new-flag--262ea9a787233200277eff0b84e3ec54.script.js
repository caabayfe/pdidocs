(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.stateModel = new ChangeRequestStateHandler().getStateModel(current);
	g_scratchpad.isNew = new ChangeRequest(current).isNew();
})(current, previous);

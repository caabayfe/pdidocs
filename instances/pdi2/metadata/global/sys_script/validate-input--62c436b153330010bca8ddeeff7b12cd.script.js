(function executeRule(current, previous /*null when async*/) {
	var interval = current.getValue('auto_refresh');
	if (interval && parseInt(interval) < 24) {
		gs.addErrorMessage(gs.getMessage("Auto-refresh minimum value is 24"));
		current.setAbortAction(true);
	}
})(current, previous);

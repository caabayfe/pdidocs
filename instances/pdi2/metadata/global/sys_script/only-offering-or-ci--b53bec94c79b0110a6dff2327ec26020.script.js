(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("Both service offering and configuration item are not allowed on the same service offering commitment record."));
    current.setAbortAction(true);
	return;
})(current, previous);

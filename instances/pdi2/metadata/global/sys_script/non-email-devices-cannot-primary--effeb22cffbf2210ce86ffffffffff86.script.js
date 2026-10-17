(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("Primary Email can only be enabled for devices of type 'Email'."));
	current.setAbortAction(true);
})(current, previous);

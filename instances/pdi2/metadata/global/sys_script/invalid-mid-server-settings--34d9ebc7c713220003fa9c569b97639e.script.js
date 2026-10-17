(function executeRule(current, previous /*null when async*/) {
	
	gs.addErrorMessage(gs.getMessage("The mid_server role cannot have the 'Elevated privilege' option set to true"));
	current.setAbortAction(true);
	
})(current, previous);

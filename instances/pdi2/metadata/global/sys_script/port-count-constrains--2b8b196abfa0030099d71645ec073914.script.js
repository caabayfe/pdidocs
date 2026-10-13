(function executeRule(current, previous /*null when async*/) {

	if(current.port_count < 4) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Port count cannot be less than 4"));
	}

})(current, previous);

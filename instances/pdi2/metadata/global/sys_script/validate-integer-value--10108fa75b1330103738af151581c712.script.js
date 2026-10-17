(function executeRule(current, previous /*null when async*/) {

	var value = current.getValue("value");
	
	if(!/^-?\d+$/.test(value)) {
		current.setWorkflow(false);
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Invalid integer value"));
	}

})(current, previous);

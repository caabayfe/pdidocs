(function executeRule(current, previous /*null when async*/) {

	if(current.getValue("value").toLowerCase() !== "true" && current.getValue("value").toLowerCase() !== "false") {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Invalid boolean value"));
	}

})(current, previous);

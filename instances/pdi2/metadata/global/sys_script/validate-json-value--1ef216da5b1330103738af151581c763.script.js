(function executeRule(current, previous /*null when async*/) {

	try {
		JSON.parse(current.getValue("value"));
	} catch(e) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Invalid JSON value"));
	}

})(current, previous);

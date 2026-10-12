(function executeRule(current, previous /*null when async*/) {

	var value = Number(current.value);
	if (!value || value < 1 || value > 8) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Default number of levels for conversion to Application Service must be between 1 and 8'));
	}

})(current, previous);

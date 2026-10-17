(function executeRule(current, previous /*null when async*/) {

	var regex = /^([1-9][0-9]?|100)$/;
	if (!regex.test(current.variable.length)) {
		gs.addErrorMessage(gs.getMessage('Length must be a whole number between 1 and 100'));
		current.setAbortAction(true);

		return false;
	}
	
	return true;

})(current, previous);

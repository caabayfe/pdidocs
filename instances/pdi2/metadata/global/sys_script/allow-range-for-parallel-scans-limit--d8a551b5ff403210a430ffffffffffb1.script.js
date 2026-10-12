(function executeRule(current, previous /*null when async*/) {
	// Validate if value is between 1 and 15
	var num = parseInt(current.value, 10);
	
	if (isNaN(num) || num < 1 || num > 15) {
		gs.addErrorMessage(gs.getMessage("Invalid value. Allowed range is 1 to 15."));
		current.setAbortAction(true); // Prevent saving the invalid value
		return;
	}

})(current, previous);

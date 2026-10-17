(function executeRule(current, previous /*null when async*/) {
	var MAX_CI_SERVICE_POPULATIONS_LIMIT = 2000;
	var newAssignedValue = current.value;

	if (!gs.nil(newAssignedValue) && newAssignedValue > MAX_CI_SERVICE_POPULATIONS_LIMIT) {
		gs.addErrorMessage(gs.getMessage("Update failed. Enter an integer value that is equal to or less than {0}", MAX_CI_SERVICE_POPULATIONS_LIMIT));
		current.setAbortAction(true);
	}

})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	var MAX_RELATIONS_LIMIT = 10000;
	var newAssignedValue = current.value;

	if (!gs.nil(newAssignedValue) && newAssignedValue > MAX_RELATIONS_LIMIT) {
		gs.addErrorMessage(gs.getMessage("Update failed. Enter an integer value that is equal to or less than {0}", MAX_RELATIONS_LIMIT));
		current.setAbortAction(true);
	}

})(current, previous);

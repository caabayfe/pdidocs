(function executeRule(current, previous /*null when async*/) {
	var MIN_LIMIT = gs.getProperty('sn_flow_designer.autosave_version_interval_minimum') || 60;
	var MAX_LIMIT = gs.getProperty('sn_flow_designer.autosave_version_interval_maximum') || 120;
	var newAssignedValue = current.value;

	if (!gs.nil(newAssignedValue) && newAssignedValue > MAX_LIMIT) {
		gs.addErrorMessage(gs.getMessage("Update failed. Enter an integer value that is equal to or less than {0}", MAX_LIMIT));
		current.setAbortAction(true);
	} else if (!gs.nil(newAssignedValue) && newAssignedValue < MIN_LIMIT) {
		gs.addErrorMessage(gs.getMessage("Update failed. Enter an integer value that is equal to or greater than {0}", MIN_LIMIT));
		current.setAbortAction(true);
	}

})(current, previous);

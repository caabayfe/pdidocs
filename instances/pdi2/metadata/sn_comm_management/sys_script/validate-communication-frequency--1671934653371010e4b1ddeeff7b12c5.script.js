(function executeRule(current, previous /*null when async*/) {

	var isValidFrequency = new CommunicationManagementUtil().validateCommunicationFrequencyForCommTaskDef(current);
	if (!isValidFrequency) {
		current.setAbortAction(true);
	}

})(current, previous);

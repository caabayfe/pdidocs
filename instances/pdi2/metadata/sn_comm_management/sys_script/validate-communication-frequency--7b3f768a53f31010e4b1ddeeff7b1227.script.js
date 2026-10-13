(function executeRule(current, previous /*null when async*/) {

	var isValidFrequency = new CommunicationManagementUtil().validateCommunicationFrequencyForCommTask(current);
	if (!isValidFrequency) {
		current.setAbortAction(true);
	}

})(current, previous);

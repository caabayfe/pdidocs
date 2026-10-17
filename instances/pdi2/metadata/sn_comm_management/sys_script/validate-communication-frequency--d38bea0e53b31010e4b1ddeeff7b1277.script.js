(function executeRule(current, previous /*null when async*/) {

	var isValidFrequency = new CommunicationManagementUtil().validateCommunicationFrequencyForChannel(current);
	if (!isValidFrequency) {
		gs.addErrorMessage(gs.getMessage('{0} is not supported for recurring communications.', [current.getDisplayValue('comm_channel_config')]));
		current.setAbortAction(true);
	}

})(current, previous);

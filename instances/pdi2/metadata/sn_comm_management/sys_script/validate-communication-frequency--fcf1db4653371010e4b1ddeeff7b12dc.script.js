(function executeRule(current, previous /*null when async*/) {

	var isValidFrequency = new CommunicationManagementUtil().validateCommunicationFrequencyForChannelDef(current);
	if (!isValidFrequency) {
		gs.addErrorMessage(gs.getMessage('{0} is not supported for recurring communications.', [current.getDisplayValue('channel')]));
		current.setAbortAction(true);
	}

})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	if (!new CommunicationManagementUtil().isChannelValidSelfCheck(current)) {
		gs.addErrorMessage(gs.getMessage('Channel values are invalid'));
		current.setAbortAction(true);
	}
})(current, previous);

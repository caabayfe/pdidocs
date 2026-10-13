(function executeRule(current, previous /*null when async*/) {
	if (!new CommunicationManagementUtil().isChannelDefValidSelfCheck(current)) {
		gs.addErrorMessage(gs.getMessage('Channel Definiton values are invalid'));
		current.setAbortAction(true);
	}
})(current, previous);

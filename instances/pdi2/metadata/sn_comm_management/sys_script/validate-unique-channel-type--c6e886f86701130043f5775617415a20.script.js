(function executeRule(current, previous /*null when async*/) {
	if (!new CommunicationManagementUtil().isChannelTypeUniqueForCommTask(current)) {
		current.setAbortAction(true);
	}

})(current, previous);

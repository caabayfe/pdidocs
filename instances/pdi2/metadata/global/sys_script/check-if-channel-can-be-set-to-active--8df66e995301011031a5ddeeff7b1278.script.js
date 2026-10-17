(function executeRule(current, previous /*null when async*/) {

	if (!AutoResolutionResponseChannelHelper.canActivateResponseChannel(current)) {
		current.setAbortAction(true);
	}

})(current, previous);

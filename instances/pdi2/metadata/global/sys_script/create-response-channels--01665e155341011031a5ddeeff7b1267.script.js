(function executeRule(current, previous /*null when async*/) {

	if (AutoResolutionResponseChannelHelper.shouldCreateResponseChannels(current.sys_id))
		AutoResolutionResponseChannelHelper.createResponseChannelForARConfig(current.sys_id);

})(current, previous);

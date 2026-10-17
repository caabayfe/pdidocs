(function executeRule(current, previous /*null when async*/) {

	var configGr = current.ar_configuration;
	if (!configGr.active)
		return;

	var activeResponseChannels = global.AutoResolutionAPIHelper.getActiveResponseChannelsByConfiguration(configGr.sys_id);
	for (var i = 0; i < activeResponseChannels.length; i++) {
		if (activeResponseChannels[i] === global.AutoResolutionNotificationHelper.RESPONSE_CHANNEL.VA)
			return;
	}

	gs.addErrorMessage(gs.getMessage('The Virtual Agent response channel must be active.'));
	current.active = previous.active;
	current.setAbortAction(true);

})(current, previous);

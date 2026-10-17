(function executeRule(current, previous /*null when async*/) {

	var activeIntents = global.AutoResolutionAPI.getActiveMappedIntents(current.target_table_name);
	var activeResponseChannels = global.AutoResolutionAPIHelper.getActiveResponseChannelsByConfiguration(current.sys_id);
	
	if (activeIntents.length !== 0) {

		for (var i = 0; i < activeResponseChannels.length; i++) {
			if (activeResponseChannels[i] === global.AutoResolutionNotificationHelper.RESPONSE_CHANNEL.VA)
				return;
		}

		gs.addErrorMessage(gs.getMessage('The Virtual Agent response channel must be active.'));
		current.active = previous.active;
		current.setAbortAction(true);
	}

	else if (current.ais_enabled && activeResponseChannels.length === 0) {
		gs.addErrorMessage(gs.getMessage('At least one response channel must be active.'));
		current.active = previous.active;
		current.setAbortAction(true);
	}

})(current, previous);

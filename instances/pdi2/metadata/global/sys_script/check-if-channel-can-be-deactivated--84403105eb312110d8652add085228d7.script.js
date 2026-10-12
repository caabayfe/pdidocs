(function executeRule(current, previous /*null when async*/) {

	var activeResponseChannels = global.AutoResolutionAPIHelper.getActiveResponseChannelsByConfiguration(current.getValue('configuration'));

	if (current.getValue('response_channel') === global.AutoResolutionNotificationHelper.RESPONSE_CHANNEL.VA) {

		var activeIntents = global.AutoResolutionAPI.getActiveMappedIntents(current.configuration.target_table_name);

		if (activeIntents.length !== 0) {
			gs.addErrorMessage(gs.getMessage('The Virtual Agent response channel must be active.'));
			current.active = previous.active;
			current.setAbortAction(true);
			return;
		}
	}

	if (activeResponseChannels.length === 1) {
		gs.addErrorMessage(gs.getMessage('At least one response channel must be active.'));
		current.active = previous.active;
		current.setAbortAction(true);
	}

})(current, previous);

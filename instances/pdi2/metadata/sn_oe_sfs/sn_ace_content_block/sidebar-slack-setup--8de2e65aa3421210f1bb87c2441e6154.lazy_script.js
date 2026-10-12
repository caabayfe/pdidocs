
(function(context, pageParams, blockcontext){
	// return some_output
	var util = new CollabSlackUtil();
	var collabProviderApp = util.getCollabProviderApp();
	var isSlackEnabled = false;
	var isTeamsEnabled = false;
	var preferenceChannel = "";
	
	var collabSettingsGr = new GlideRecord("sys_cs_collab_settings");
	collabSettingsGr.query();
	if (collabSettingsGr.next()) {
		isSlackEnabled = collabSettingsGr.getValue("enable_slack") == "1";
		isTeamsEnabled = collabSettingsGr.getValue("enable_teams") == "1";
		preferenceChannel = collabSettingsGr.getValue("preference_channel");
	}

	return {
		instanceName: util.getInstanceName(),
		isSlackConfigured: collabProviderApp.isSlackConfigured,
		readOnly: collabProviderApp.readOnly,
		clientId: collabProviderApp.clientId,
		clientSecret: collabProviderApp.clientSecret,
		signingSecret: collabProviderApp.signingSecret,
		botUserOauthToken: collabProviderApp.botUserOauthToken,
		isSlackEnabled: isSlackEnabled,
		isTeamsEnabled: isTeamsEnabled,
		preferenceChannel: preferenceChannel
	};
})(context, pageParams, blockcontext);

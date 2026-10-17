(function () {
	var collabSettingDto = sn_collab.CollabChatScriptObject.getCollabChatSettingForCurrentDomain();
	if (collabSettingDto) {
		var isSlackEnabled = collabSettingDto.slackEnabled;
		var preferenceChannel = collabSettingDto.preferenceChannel;
		// Only run if slack is enabled and preference channel is set to Slack channel
		if (isSlackEnabled && preferenceChannel === "a2db3911a3f382106cdec213d51e6181") {
			return true;
		}
	}
	return false;
})();

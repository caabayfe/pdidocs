(function executeRule(current, previous /*null when async*/) {
	var teamsChannelId = 'a812eaf8c32111100f24c87af040dd59';
	var subscribeTeamsAppJobSysId = 'cc311fb3b73d1110ffe5ef54ce11a9c2';
	var notificationUrl = current.callback_url;

	if (!gs.nil(notificationUrl)) {
		new sn_oe_sfs.CollabChatUtils().unSubscribeTeams(teamsChannelId);
		
		var gr = new GlideRecord('sysauto_script');
		if (gr.get(subscribeTeamsAppJobSysId)) {
			new global.CollabChatGlobalUtils().executeScheduledJob(gr);
		}
	}

})(current, previous);

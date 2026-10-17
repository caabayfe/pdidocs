(function executeRule(current, previous /*null when async*/) {
	// Scheduled Job "Subscribe Teams App"
	var gr = new GlideRecord('sysauto_script');
	var SubscribeTeamsAppSysId = 'cc311fb3b73d1110ffe5ef54ce11a9c2';
	gr.get(SubscribeTeamsAppSysId);
	
	if (current.enable_teams) {	
		gr.setValue('active', true);
		gr.update();
		//execute the scheduled job now
		new global.CollabChatGlobalUtils().executeScheduledJob(gr);
	} else {
		gr.setValue('active', false);
		gr.update();
		
		var teamsChannelId = 'a812eaf8c32111100f24c87af040dd59';
		new sn_oe_sfs.CollabChatUtils().unSubscribeTeams(teamsChannelId);
	}
})(current, previous);

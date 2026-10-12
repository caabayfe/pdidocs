(function executeRule(current, previous /*null when async*/) {

	var profile = current.profile;
	if(!profile) {
 	    profile = new GlideappLiveProfile().getIDFromProfileOrUser(current.user);
	    if (!profile)
            return;
	    current.setValue("profile", profile);
		current.update();
	}
	
	var liveGroupProfileGR = new GlideRecord("live_group_profile");
	liveGroupProfileGR.setWorkflow(false);
	liveGroupProfileGR.addQuery("document", current.document);
	liveGroupProfileGR.addQuery("table", current.table);
	liveGroupProfileGR.addQuery("type", "!=", "support");
	liveGroupProfileGR.query();

	if(liveGroupProfileGR.next()) {
		var liveGroupMemberGR = new GlideRecord("live_group_member");
		liveGroupMemberGR.setWorkflow(false);
		liveGroupMemberGR.addQuery("group", liveGroupProfileGR.getUniqueValue());
		liveGroupMemberGR.addQuery("member", profile);
		liveGroupMemberGR.addQuery("state", "!=", "inactive");
		liveGroupMemberGR.query();

		if(liveGroupMemberGR.next()) {
			return;
		}
	}

	new GlideNotificationBroadcaster().broadcast({
		title: current.title,
		message: current.message,
		table: current.table,
		document: current.document
	}, profile);

})(current, previous);

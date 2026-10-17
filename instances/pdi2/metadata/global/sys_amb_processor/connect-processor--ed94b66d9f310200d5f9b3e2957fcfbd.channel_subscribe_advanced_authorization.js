function /*boolean*/ authorizeSubscribe(/*String*/ channel, /*String*/ user) {
	if(channel === "/connect/support/queues")
		return true; // Handled by separate processor

	var channelIDMatch = channel.match(/\/connect.*\/(\w{32})/);
	if(!channelIDMatch)
		return false;

	if (gs.getUserID() === channelIDMatch[1] || gs.getSessionID() === channelIDMatch[1]) {
		return true;
	}

	// /connect/support/conversation/{group_id}
	// user must be a member
	var liveProfileGR = new GlideRecord("live_profile");
	liveProfileGR.addQuery("table", "sys_user");
	liveProfileGR.addQuery("document", gs.getUserID());
	liveProfileGR.query();
	if (liveProfileGR.next()) {
		var liveGroupMemberGR = new GlideRecord("live_group_member");
		liveGroupMemberGR.addQuery("group", channelIDMatch[1]);
		liveGroupMemberGR.addQuery("member", liveProfileGR.getUniqueValue());
		liveGroupMemberGR.query();
		if (liveGroupMemberGR.next())
			return true;
	}

	return false;
}

answer = canReadMessage();

function canReadMessage() {
	var group = current.group;
	
	// Allow read access to User if the message does not belong to any group
	if (!group)
		return true;
	
	// If you made it, you can read it
	if (current.sys_created_by.equals(gs.getUserName())) {
		return true;
	}
	
	// If you're a live feed admin, you can read any messages you want
	if (gs.getUser().hasRole('live_feed_admin')) {
		return true;
	}
	
	// If you're a member of the group the message is in, you should be able to see it
	var currentProfile = new GlideappLiveProfile().getID();
	var activeStates = ["active", "admin", "observer"];
	
	var groupMemberGR = new GlideRecord("live_group_member");
	groupMemberGR.setWorkflow(false);
	groupMemberGR.addQuery("group", group);
	groupMemberGR.addQuery("state", "IN", activeStates);
	groupMemberGR.addQuery("member", currentProfile);

	groupMemberGR.query();
	
	if(groupMemberGR.next()) {
		return true;
	}
	
	return false;
}

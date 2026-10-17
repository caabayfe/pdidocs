(function executeRule(current, previous /*null when async*/) {

	var groupsForThisBoard = new GlideRecord("live_group_profile");
	groupsForThisBoard.addQuery("table", "vtb_board");
	groupsForThisBoard.addQuery("document", current.board);
	groupsForThisBoard.query();

	var groupIDs = [];
	var collaborationManager = new GlideCollaborationManager();
	while(groupsForThisBoard.next()) {
		if(checkExistingMembership(current.user, groupsForThisBoard.sys_id)) {
			collaborationManager.removeMemberFromGroup("sys_user." + current.user, "live_group_profile." + groupsForThisBoard.sys_id);
		}
	}

	function checkExistingMembership(user, group) {
		var membership = new GlideRecord("live_group_member");
		membership.addQuery("group", group);
		membership.addQuery("member.document", user);
		membership.query();

		return membership.next();
	}

})(current, previous);

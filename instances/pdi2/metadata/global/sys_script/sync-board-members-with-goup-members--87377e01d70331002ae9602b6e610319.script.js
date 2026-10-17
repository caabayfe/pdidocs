function onAfter(current, previous) {
	var group = current.group.getRefRecord();
	if(group.table != "vtb_board")
		return;

	// adding board members to live group //
	var membersForThisBoard = new GlideRecord("vtb_board_member");
	membersForThisBoard.addQuery("board", group.document);
	membersForThisBoard.query();

	var collaborationManager = new GlideCollaborationManager();
	while(membersForThisBoard.next()) {
		var userMember = new GlideRecord("live_group_member");
		userMember.addQuery("member.document", membersForThisBoard.user);
		userMember.addQuery("group", group.sys_id);
		userMember.query();

		if(userMember.getRowCount() === 0)
			collaborationManager.addMemberToGroup("sys_user." + membersForThisBoard.user, "live_group_profile." + group.sys_id);
	}
	
	// add the board owner if not already present //
	var boardOwner = new GlideRecord("vtb_board");
	boardOwner.addQuery("sys_id", group.document);
	boardOwner.query();
	
	if (boardOwner.next()) {
		var groupMember = new GlideRecord("live_group_member");
		groupMember.addQuery("member.document", boardOwner.getValue("owner"));
		groupMember.addQuery("group", group.sys_id);
		groupMember.query();
		
		if (!groupMember.next()) {
			collaborationManager.addMemberToGroup("sys_user." + boardOwner.getValue("owner"), "live_group_profile." + group.sys_id);
		}
	}
}

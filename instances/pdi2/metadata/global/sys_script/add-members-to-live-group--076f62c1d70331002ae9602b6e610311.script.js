function onAfter(current, previous) {
	var groupsForThisBoard = new GlideRecord("live_group_profile");
	groupsForThisBoard.addQuery("table", "vtb_board");
	groupsForThisBoard.addQuery("document", current.board);
	groupsForThisBoard.query();
	
	var groupIDs = [];
	var collaborationManager = new GlideCollaborationManager();
	while(groupsForThisBoard.next()) {		
			collaborationManager.addMemberToGroup("sys_user." + current.user, "live_group_profile." + groupsForThisBoard.sys_id);
	}
}

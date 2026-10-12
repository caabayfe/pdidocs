function onAfter(current, previous) {
	var group = current.group.getRefRecord();
	var profile = current.member.getRefRecord();
	
	var boardMembers = new GlideRecord("vtb_board_member");
	boardMembers.addQuery("user", profile.document);
	boardMembers.addQuery("board", group.document);
	boardMembers.query();
	
	var board = new GlideRecord("vtb_board");
		
	if(!board.get(group.document) || boardMembers.next()) {
		gs.breaker("could not find document");
		return;
	}
	
	var newMember = new GlideRecord("vtb_board_member");
	newMember.user = profile.document;
	newMember.board = group.document;
	newMember.insert();
	
	board.setForceUpdate(true);
	board.update();
}

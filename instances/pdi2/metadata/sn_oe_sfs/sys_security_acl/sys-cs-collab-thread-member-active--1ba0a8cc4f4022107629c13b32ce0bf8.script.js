if (!current.collab_member.member)
	answer = false;

answer = gs.getUserID() == current.collab_member.member.user_document;

answer = canReadMessage();

function canReadMessage() {
	// If you sent it, you can read it
	if (current.sent_by_member != null && current.sent_by_member.member != null 
		&& gs.getUserName().equals(current.sent_by_member.member.user_document.user_name)) {
		return true;
	}

	var collabChatUtils = new CollabChatUtils();
	if (!collabChatUtils.isMessageAudience(current))
		return false;
	
	return collabChatUtils.canReadBaseRecord(current.collab_chat) && new sn_oe_sfs.SidebarAccessCheckUtils().canRead(current.collab_chat);
}

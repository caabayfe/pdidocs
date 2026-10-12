answer = canReadMessage();

function canReadMessage() {
	var collabChatUtils = new CollabChatUtils();
	if (!collabChatUtils.isMessageAudience(current.parent_message))
		return false;
	
	return collabChatUtils.canReadBaseRecord(current.collab_chat);
}

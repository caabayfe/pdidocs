(function executeRule(current, previous /*null when async*/ ) {
    var conversationID = current.getValue("topic");
	var isSessionResumable = !current.guest || gs.getProperty("com.glide.cs.guest_session_resumable") === true;
	// Only fault the conversation if the conversation is in live chat mode or non-resumable
    if (sn_cs.VASystemObject.getInteractionType(conversationID) == 'chat' &&
		(!isSessionResumable || sn_cs.VASystemObject.isLiveChatInProgress(conversationID))){
		sn_cs.VASystemObject.faultAbandonedConversation(conversationID);
	}
})(current, previous);

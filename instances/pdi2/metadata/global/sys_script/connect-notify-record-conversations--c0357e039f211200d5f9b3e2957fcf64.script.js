(function executeRule(current, previous /*null when async*/) {

	var collaborationManager = new GlideCollaborationManager();
	collaborationManager.sendAttachmentToRecordConversation(current);

})(current, previous);

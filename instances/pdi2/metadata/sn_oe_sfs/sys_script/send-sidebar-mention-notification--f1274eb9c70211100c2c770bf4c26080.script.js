(function executeRule(current, previous /*null when async*/) {
	var mentionedUserId = current.collab_user.user;
	var isCollabChatEnabled = new global.CollabChatGlobalUtils().isCollabChatEnabledInUserDomain(mentionedUserId);
	if (!isCollabChatEnabled)
		return;
	
	var chatId = current.message.collab_chat_id;
	var messageId = current.message.sys_id;
	var senderName = '';
	if (!current.message.sent_by_member.collab_user.user) {
		//for external users, get user name from sys_cs_collab_provider_user_profile
		senderCollabUser = current.message.sent_by_member.collab_user;
		var profile = new GlideRecord('sys_cs_collab_provider_user_profile');
		profile.addQuery('collab_user', senderCollabUser);
		profile.addActiveQuery();
		profile.query();
		if (!profile.next()) {
			gs.error("Cannot find user profile for collab user %s", senderCollabUser);
		}
		senderName = profile.display_name;
	} else {
		//for internal user, get the current user's name
		senderName = gs.getUser().getDisplayName();
	}
	
	sn_collab.CollabChatScriptObject.sendMentionNotification(mentionedUserId, chatId, messageId, senderName);

})(current, previous);

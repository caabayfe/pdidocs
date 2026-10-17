(function executeRule(current, previous /*null when async*/) {
	var creatorLang = new global.CollabChatGlobalUtils().getCollabChatCreatorLanguage(current.collab_chat_member.collab_chat);
	var newMemberName = '';
	if (current.collab_chat_member.collab_user.external_user) {
		var collabUserSysId = current.collab_chat_member.collab_user;
		var gr = new GlideRecord('sys_cs_collab_provider_user_profile');
		gr.addActiveQuery();
		gr.addQuery('collab_user', collabUserSysId);
		gr.query();
		// One collab user can have multiple provider user profiles. For now,
		// we use the first profiles's display name.
		if (gr.next())
			newMemberName = gr.getValue('display_name');
	} else {
		newMemberName = current.getDisplayValue('collab_chat_member.collab_user.user');
	}
	
	sn_collab.CollabChatScriptObject.sendSystemMessage(
		current.collab_chat_member.collab_chat,
		gs.getMessageLang("{0} joined the discussion.", creatorLang, [newMemberName])
	);
})(current, previous);

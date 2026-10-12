(function executeCondition(/* glide record */ current) {
	var preChatUtil = new sn_hr_sp.esc_PreChatUtil();
	
	if (!GlidePluginManager.isActive("com.glide.cs.chatbot") && !preChatUtil.showAskAQuestionPreChat(current)) {
		// sys_id of the current record is passed as esc_pre_chat_id. 
		var esc_pre_chat_id = "c65b40d5530000102905ddeeff7b12e6";
		// configure portal & user criteria in sn_hr_sp_pre_chat_survey_config for applicability.
		return preChatUtil.isApplicable(current, esc_pre_chat_id);
	}
})(current);

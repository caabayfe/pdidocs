(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.isConversationBuilderPluginActive=new GlidePluginManager().isActive('com.snc.conversation_builder');

})(current, previous);

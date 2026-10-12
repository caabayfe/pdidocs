(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.showNLU = GlidePluginManager.isActive('com.glide.cs.chatbot');
})(current, previous);

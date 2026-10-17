(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.isEmbeddablesPluginInstalled = GlidePluginManager.isActive("com.glide.ux.embeddables");
})(current, previous);

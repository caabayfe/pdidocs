(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.isMlbPluginInstalled = new GlidePluginManager().isActive('com.snc.pa.mlb');
})(current, previous);

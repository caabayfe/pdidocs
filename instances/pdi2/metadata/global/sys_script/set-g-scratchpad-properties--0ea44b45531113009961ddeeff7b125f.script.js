(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.isPluginActiveProcurement = GlidePluginManager.isActive('com.snc.procurement');

})(current, previous);

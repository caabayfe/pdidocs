(function executeRule(current, previous /*null when async*/) {

	var goalSI = new sn_gf.GFCoreGoal(current.getUniqueValue(),current);
	g_scratchpad.goal_contains_child = goalSI.containsChild();
	g_scratchpad.isAPWInstalled = GlidePluginManager.isActive('com.sn_align_ws');

})(current, previous);

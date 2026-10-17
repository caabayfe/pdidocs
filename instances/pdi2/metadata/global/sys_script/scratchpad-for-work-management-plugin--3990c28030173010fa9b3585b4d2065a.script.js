(function executeRule(current, previous /* null when async */) {
	g_scratchpad.isFSMPluginEnabled = GlidePluginManager.isActive('com.snc.work_management') || GlidePluginManager.isActive('com.snc.field_service_management');
	g_scratchpad.isPartRequirementColumnPresent = current.isValidField('part_requirement');
}(current, previous));

(function() {
	if (pm.isZboot())
		return;

	var apiVersion = gs.getProperty('glide.activity.api_version', '0');
	if (apiVersion !== "1") {
		gs.setProperty('glide.activity.api_version', '1');
		gs.log('Forced Activity Stream to Version 1', "FIX_SCRIPT_ENABLE_ACTIVITY_V1");
	}

	// For some customers, activity rule properties were added in Quebec to ensure that sys_activity capture was completely turned off.
	// They will prevent V1 from working if enabled.
	var activityRuleProperties = new GlideRecord('sys_properties');
	activityRuleProperties.addQuery('name', 'STARTSWITH', 'glide.activity.rule.active.');
	activityRuleProperties.query();

	if (activityRuleProperties.getRowCount() > 0) {
		gs.print('Deleting activity rule properties', "FIX_SCRIPT_ENABLE_ACTIVITY_V1");
		activityRuleProperties.deleteMultiple();
	}
})();

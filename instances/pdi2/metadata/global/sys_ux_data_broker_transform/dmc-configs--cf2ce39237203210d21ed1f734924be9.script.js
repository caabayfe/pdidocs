function fetchConfigs() {
	const ruleManagementEnabled = JSON.parse(gs.getProperty("com.glide.data_management.console.rule_management_enabled", false));

	return {
		rule_management_enabled : ruleManagementEnabled
	};
}

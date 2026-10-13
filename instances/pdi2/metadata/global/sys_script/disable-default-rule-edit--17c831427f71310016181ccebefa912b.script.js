function onBefore(current, previous) {
	/// disable edit for default rules
	if (previous.business_service == null || previous.business_service == ''){
		current.name = previous.name;
		current.business_service = previous.business_service;
		current.cmdb_ci = previous.cmdb_ci;
		current.impact_rule_definition = previous.impact_rule_definition;
		current.contribution_type = previous.contribution_type;
		current.contribution = previous.contribution;
		current.critical = previous.critical;
		current.major = previous.major;
		current.minor = previous.minor;
		current.warning = previous.warning;
		current.impact_on = previous.impact_on;
	}
}

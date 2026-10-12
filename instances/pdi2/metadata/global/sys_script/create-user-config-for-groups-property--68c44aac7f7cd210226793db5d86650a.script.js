(function executeRule(current, previous /*null when async*/) {
	var userPropertyConfigGR = new GlideRecord("sys_analytics_user_property_config");
	userPropertyConfigGR.table_name = "sys_user_grmember";
	userPropertyConfigGR.is_synchronized = false;
	userPropertyConfigGR.is_configurable = false;
	userPropertyConfigGR.field_name = "user";
	userPropertyConfigGR.insert();
})(current, previous);

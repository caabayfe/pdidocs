(function executeRule(current, previous /*null when async*/) {
	var userPropertyConfigGR = new GlideRecord("sys_analytics_user_property_config");
	userPropertyConfigGR.addQuery("table_name", "sys_user_grmember");
	userPropertyConfigGR.query();
	userPropertyConfigGR.deleteMultiple();
})(current, previous);

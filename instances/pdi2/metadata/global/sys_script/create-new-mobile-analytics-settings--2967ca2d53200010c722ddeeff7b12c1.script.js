(function executeRule(current, previous /*null when async*/) {
	sn_mobile_analytics.MobileAnalytics.createSettingsForNativeClient(current.sys_id, current.type);
})(current, previous);

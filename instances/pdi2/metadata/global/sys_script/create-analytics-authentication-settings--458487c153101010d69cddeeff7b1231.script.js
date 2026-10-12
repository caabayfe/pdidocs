(function executeRule(current, previous /*null when async*/) {
	if(sn_app_analytics.SNAnalytics.isEnabled()) {
		sn_app_analytics.SNAnalytics.processAllUnRegisteredSettings();
	}
})(current, previous);

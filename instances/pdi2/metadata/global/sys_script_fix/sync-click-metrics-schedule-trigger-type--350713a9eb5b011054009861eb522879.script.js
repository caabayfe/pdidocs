var val = gs.getProperty(global.VAClickMetricsConstants.CLICK_METRICS_EVENT_ENABLED_PROP_NAME);

if (!gs.nil(val)) {
	var eventEnabled = (val === 'true');
	global.VAClickMetrics.updateClickMetricsScheduleJobTriggerType(eventEnabled);
}

disableClickMetricsSysTriggers();

function disableClickMetricsSysTriggers() {
	global.VAClickMetrics.updateClickMetricsScheduleJobTriggerType(false);
}

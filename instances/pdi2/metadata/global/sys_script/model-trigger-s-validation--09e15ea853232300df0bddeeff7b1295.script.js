(function executeRule(current, previous /*null when async*/) {
	new MetricBaseTriggerUtils().validateModelTrigger(current);
})(current, previous);

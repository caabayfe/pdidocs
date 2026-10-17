(function executeRule(current, previous /*null when async*/) {
	new MetricBaseTriggerUtils().validateLinearTrigger(current);
})(current, previous);

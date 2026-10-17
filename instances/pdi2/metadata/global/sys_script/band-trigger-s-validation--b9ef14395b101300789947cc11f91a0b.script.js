(function executeRule(current, previous /*null when async*/) {
	new MetricBaseTriggerUtils().validateBandTrigger(current);
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	new MetricBaseTriggerUtils().validateModelTriggerLevel(current);
	if (current.getLastErrorMessage() != null) {
		var triggerLink = current.trigger.getRefRecord().getLink(true);
		gs.setRedirect(triggerLink);
	}
})(current, previous);

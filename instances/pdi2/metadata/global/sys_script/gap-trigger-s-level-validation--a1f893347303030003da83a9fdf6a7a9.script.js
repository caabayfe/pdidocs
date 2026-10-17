(function executeRule(current, previous /*null when async*/) {	
	new MetricBaseTriggerUtils().validateGapTriggerLevel(current);
	if (current.getLastErrorMessage() != null) {
		var triggerLink = current.trigger.getRefRecord().getLink(true);
		gs.setRedirect(triggerLink);
	}
})(current, previous);

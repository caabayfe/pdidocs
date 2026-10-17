var eventPayload = event.parm1;
var event = event.parm2;
var invalidator = new SNC.AllTimeThresholdInvalidator();

if (invalidator.isKpiChangeEvent(event)) {
	invalidator.invalidateAllTimeThresholdsForKPI(eventPayload);
}

if (invalidator.isRetentionChangeEvent(event)) {
	invalidator.invalidateAllTimeThresholdsForSourceOnRetentionChange(eventPayload);
}

if (invalidator.isGapsCreatedEvent(event)) {
	var parsedPayload = JSON.parse(eventPayload);
	invalidator.invalidateAllTimeThresholdsForSourceOnGapsIntroduction(parsedPayload.source_id, parsedPayload.start, parsedPayload.end);
}

gs.info("AllTimeThresholdInvalidator invoked for event: " + event);

(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.incidentState = new JSON().encode(IncidentState);
	g_scratchpad.incidentReason = new JSON().encode(IncidentReason);
})(current, previous);

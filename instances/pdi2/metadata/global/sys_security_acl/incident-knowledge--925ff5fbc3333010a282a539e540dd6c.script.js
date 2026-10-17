answer = true;
if ((current.incident_state == IncidentState.CLOSED || current.incident_state == IncidentState.CANCELED) && !gs.hasRole('nobody')) {
	answer = false;
}

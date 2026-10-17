answer = true;
if (current.major_incident_state == 'accepted' && !gs.hasRole('nobody')) {
	answer = false;
}

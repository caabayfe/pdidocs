answer = true;
if(pm.isActive('com.snc.incident.mim') && current.major_incident_state == 'accepted'){
	if(gs.hasRole('major_incident_manager'))
		answer = true;
	else
		answer = false;
}

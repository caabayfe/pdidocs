(function executeRule(current, previous /*null when async*/ ) {

	gs.eventQueue("incident.major_incident_state_changed", current, current.major_incident_state, previous.major_incident_state);

	if (current.major_incident_state != previous.major_incident_state) {
		var miState = new sn_major_inc_mgmt.MajorIncidentTriggerRules(current).MAJOR_INCIDENT_STATE;
		if (current.major_incident_state == miState.ACCEPTED) {
			current.promoted_by = gs.getUserID();
			current.promoted_on = new GlideDateTime();
		} else if (current.major_incident_state == miState.PROPOSED) {
			current.proposed_by = gs.getUserID();
			current.proposed_on = new GlideDateTime();
		}
	}

})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	
	var ON_HOLD_REASON_AWAITING_CALLER = 1;

	// If child incident is already Closed or Cancelled, child incident should not get re-opened
	if (current.incident_state == IncidentState.CLOSED || current.incident_state == IncidentState.CANCELED)
		return;

	// If parent incident is already Closed or Cancelled, child incident state should not get derived from parent incident
	if (current.parent_incident.incident_state == IncidentState.CLOSED || current.parent_incident.incident_state == IncidentState.CANCELED)
		return;
	
	// If parent incident was re-opened by ESS user, child incident should not get re-opened from a resolved state
	var lastReopenedBy = gs.getUser().getUserByID(current.parent_incident.reopened_by);
	if (!lastReopenedBy.hasRole("itil,sn_incident_write"))
		if (current.incident_state == IncidentState.RESOLVED)
			return;

	// Add a message if child incidents state is being updated to resolved, due to parent incident being resolved
	// Update child incident's close code and close notes to match that of parent incident
	if (current.incident_state != IncidentState.RESOLVED && current.parent_incident.incident_state == IncidentState.RESOLVED) {
		var msg = "";
				
		if (current.isValidField("close_notes") && current.close_notes.nil()) {
			msg = gs.getMessage('{0} copied from Parent Incident', current.close_notes.getLabel());
			if (current.parent_incident.close_notes.toString().indexOf(msg) == 0)
				current.close_notes = current.parent_incident.close_notes;
			else
				current.close_notes = msg + ": " + current.parent_incident.close_notes;
		}
		if(current.isValidField("close_code"))
			current.close_code = current.parent_incident.close_code;

		msg = gs.getMessage("Resolved based on resolution of Parent Incident.");
		if (current.parent_incident.comments.toString().indexOf(msg) == 0)
			current.comments = current.parent_incident.comments;
		else
			current.comments = msg + " " + current.parent_incident.comments;
	}
	else {
		// States other than Resolved should not get synced up if "com.snc.best_practice.incident.kingston" is not active
		// So that customers upgrading from prior to Kingston, do not see a change in behavior
		if (!pm.isActive("com.snc.best_practice.incident.kingston"))
			return;
		
		// If parent_incident is on hold due to AWAITING_CALLER, then child incident state should not get updated
		if ( current.parent_incident.incident_state == IncidentState.ON_HOLD && current.parent_incident.hold_reason == ON_HOLD_REASON_AWAITING_CALLER)
			return;
	}

	// Update child incident's Incident State, State and On Hold Reason fields to match that of parent incident
	current.incident_state = current.parent_incident.incident_state;
	current.state = current.parent_incident.state;
	current.hold_reason = current.parent_incident.hold_reason;

})(current, previous);

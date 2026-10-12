synchChildIncidents();

function synchChildIncidents() {
	var updateChildState = false;
	var updateOnHoldReason = false;
	var ON_HOLD_REASON_AWAITING_CALLER = 1;
	if ((current.incident_state.changes() && current.incident_state != IncidentState.RESOLVED && current.incident_state !=
			IncidentState.CLOSED && current.incident_state != IncidentState.CANCELED &&
			!(current.incident_state == IncidentState.ON_HOLD && current.hold_reason == ON_HOLD_REASON_AWAITING_CALLER)
		) ||
		(current.incident_state == IncidentState.ON_HOLD && current.hold_reason != ON_HOLD_REASON_AWAITING_CALLER)) {
		updateChildState = true;
	}
	if (current.incident_state == IncidentState.ON_HOLD && current.hold_reason && current.hold_reason.changes() &&
		current.hold_reason != ON_HOLD_REASON_AWAITING_CALLER) {
		updateOnHoldReason = true;
	}
	if (updateChildState || updateOnHoldReason)
		updateChildIncidents(updateChildState, updateOnHoldReason);
}

function updateChildIncidents(updateChildState, updateOnHoldReason) {
	var gr = new GlideRecord("incident");
	gr.addQuery("parent_incident", current.sys_id);
	var lastReopenedBy = gs.getUser().getUserByID(current.reopened_by);
	if (!lastReopenedBy.hasRole("itil,sn_incident_write"))
		gr.addQuery("incident_state", "!=", IncidentState.RESOLVED);
	gr.addQuery("incident_state", "!=", IncidentState.CLOSED);
	gr.addQuery("incident_state", "!=", IncidentState.CANCELED);
	var qc = gr.addQuery("incident_state", "!=", current.incident_state);
	if(updateOnHoldReason)
		qc.addOrCondition('hold_reason', "!=", current.hold_reason);

	gr.addActiveQuery();
	gr.query();
	if (updateChildState) {
		gr.setValue("incident_state", current.incident_state);
		gr.setValue("state", current.state);
	}
	if (updateOnHoldReason)
		gr.setValue("hold_reason", current.hold_reason);
	gr.updateMultiple();
}

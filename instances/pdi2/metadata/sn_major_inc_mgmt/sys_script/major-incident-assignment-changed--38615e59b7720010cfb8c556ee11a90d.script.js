(function executeRule(current, previous /*null when async*/) {
	var prevGroup = previous.assignment_group;
	var prevAssignee = previous.assigned_to;
	var mimGroup = gs.getProperty('sn_major_inc_mgmt.major_incident_management_group');
	if (mimGroup && current.major_incident_state == new sn_major_inc_mgmt.MajorIncidentTriggerRulesSNC().MAJOR_INCIDENT_STATE.ACCEPTED) {
		if (prevGroup) {
			gs.eventQueue('sn_major_inc_mgmt.assignmentGroup.change', current, prevGroup, prevGroup.getDisplayValue());
		}
		if (prevAssignee) {
			gs.eventQueue('sn_major_inc_mgmt.assignedTo.change', current, prevAssignee, prevAssignee.getDisplayValue());
		}
	}
})(current, previous);

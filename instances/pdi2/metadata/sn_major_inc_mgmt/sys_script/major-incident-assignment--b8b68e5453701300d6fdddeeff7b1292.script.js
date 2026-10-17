var prevGroup = previous.assignment_group;
var prevAssignee = previous.assigned_to;
var currentTxnAssignee = current.assigned_to + "";
var mimGroup = gs.getProperty('sn_major_inc_mgmt.major_incident_management_group');
if (mimGroup) {
	var onCall = (GlidePluginManager.isActive('com.snc.on_call_rotation')) ? new global.OnCallRotation() : null;
	if (current.major_incident_state == new sn_major_inc_mgmt.MajorIncidentTriggerRules().MAJOR_INCIDENT_STATE.PROPOSED && !prevGroup) {
		current.assignment_group = mimGroup;

		//check on-call rota for mim group
		if (onCall && groupHasRotas(mimGroup)) {
			var escalationPlan = whoIsOnCall(mimGroup);
			var planSize = escalationPlan.length;
			for (var i = 0; i < planSize; i++) {
				var contact = escalationPlan[i];
				if (isUserActive(contact.userId)) {
					current.assigned_to = contact.userId;
					break;
				}
			}
		}
	} else if (current.major_incident_state == new sn_major_inc_mgmt.MajorIncidentTriggerRules().MAJOR_INCIDENT_STATE.ACCEPTED) {
		current.assignment_group = mimGroup;
	}
}

if (current.major_incident_state == new sn_major_inc_mgmt.MajorIncidentTriggerRules().MAJOR_INCIDENT_STATE.ACCEPTED && current.assignment_group) {
	if (isUserBelongToGroup(gs.getUserID(), current.assignment_group))
		current.assigned_to = gs.getUserID();
}

if (current.assigned_to && current.assignment_group && !isUserBelongToGroup(current.assigned_to, current.assignment_group)) {
	gs.addInfoMessage(gs.getMessage("{0} is not a member of {1} group, so Assigned to field has been cleared", [current.assigned_to.getDisplayValue(), current.assignment_group.getDisplayValue()]));
	current.assigned_to = "";
} else if (currentTxnAssignee && current.assigned_to && current.assigned_to != currentTxnAssignee)
	gs.addInfoMessage(gs.getMessage("Incident has been reassigned to {0} from {1} group", [current.assigned_to.getDisplayValue(), current.assignment_group.getDisplayValue()]));

function groupHasRotas(group) {
	if (group) {
		var rota = new GlideRecord('cmn_rota');
		rota.addActiveQuery();
		rota.query('group', group);
		return rota.next();
	}
	return false;
}

function isUserActive(userId) {
	var gr = new GlideRecord("sys_user");
	return gr.get(userId) && gr.active == true;
}

function whoIsOnCall(groupId) {
	if (groupId) {
		var escalatees = onCall.getEscalatees(groupId);
		for (var i = 0; i < escalatees.length; i++) {
			escalatees[i].id = escalatees[i].userId;
		}
		return escalatees;
	}
}

function isUserBelongToGroup(userId, groupId) {
    var gr = new GlideRecord('sys_user_grmember');
    gr.addQuery('group', groupId);
    gr.addQuery('user', userId);
    gr.query();
    return gr.hasNext();
}

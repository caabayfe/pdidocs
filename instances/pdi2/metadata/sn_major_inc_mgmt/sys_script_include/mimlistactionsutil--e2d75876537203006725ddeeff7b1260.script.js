var MIMListActionsUtil = Class.create();
MIMListActionsUtil.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	addManyRelatedAjax: function() {
		var taskSysId = this.getParameter('sysparm_task_sys_id');
		var incidents = this.getParameter('sysparm_selected_incidents');
		return this.addManyRelated(taskSysId, incidents.split(","));
	},

	addManyRelated: function(taskSysId, incidentSysIds) {
		this.incidentState = global.IncidentState;
		if(!gs.hasRole('itil, sn_incident_write'))
			return;
		var taskGr = new GlideRecord('incident');
		if (!taskGr.get(taskSysId))
			return;
		var incidentGr = new GlideRecord('incident');
		incidentGr.addQuery('sys_id', 'IN', incidentSysIds);
		incidentGr.query();
		while (incidentGr.next()) {
			if (new sn_major_inc_mgmt.MajorIncidentTriggerRules(incidentGr).canLinkToMajorincident()) {
				incidentGr.setValue('parent_incident', taskGr.getUniqueValue());
				incidentGr.update();
			}
		}
		var result = this.newItem("result");
		result.setAttribute("incidentId", taskSysId);
		result.setAttribute("displayValue", taskGr.getDisplayValue());
		return result;
	},

	rejectMIC: function() {
		if(!gs.hasRole('itil, sn_incident_write'))
			return;
		var map = [];
		var count = 0;
		var rejectionReason = this.getParameter('sysparm_notes_value');
		rejectionReason = gs.getMessage("Major incident candidate rejected") + "\n" + rejectionReason;
		var selectedIncidents = this.getParameter('sysparm_sysids');
		var incidentGr = new GlideRecord('incident');
		incidentGr.addQuery('sys_id', 'IN', selectedIncidents);
		incidentGr.query();
		while (incidentGr.next()) {
			var triggerRuleObj = new sn_major_inc_mgmt.MajorIncidentTriggerRules(incidentGr);
			if (triggerRuleObj.isMIC()) {
				incidentGr.setValue('major_incident_state', triggerRuleObj.MAJOR_INCIDENT_STATE.REJECTED);
				incidentGr.work_notes = rejectionReason;
				incidentGr.update();
				map.push({key: incidentGr.getDisplayValue(), value: incidentGr.getUniqueValue()});
				count++;
			}
		}
		var result =  this.newItem("result");
		result.setAttribute("rejectedIncidents", JSON.stringify(map));
		result.setAttribute("rejectedCount", count);
		return result;
	},

	type: 'MIMListActionsUtil'
});

var EvtMgmtLegacyAlertRuleActions = Class.create();
EvtMgmtLegacyAlertRuleActions.prototype = {
    initialize: function() {
    },

    type: 'EvtMgmtLegacyAlertRuleActions'
};	
EvtMgmtLegacyAlertRuleActions.createTask= function(ruleGR,alertGR){
	gs.include('EvtMgmtRemoteIncidentAdapter');
	gs.include('EvtMgmtIncidentHandler');

	//getting the rest of the params from the alert management rule
	var ruleType=ruleGR.getValue('type');
	if(!ruleType){
		ruleType='incident';
		ruleGR.type=ruleType;
	}
		
	var taskTemplate=ruleGR.getValue('incident_template');
	//calling the legacy code for incident creation  
	var mutex = new GlideSelfCleaningMutex('alert_'+alertGR.sys_id, 'EvtMgmtIncidentHandler');
	mutex.get();
	try {
		var createdIncident=true;
		var alert = new GlideRecord('em_alert');
		alert.get(alertGR.sys_id);
		if (!(!alert.incident.nil() || !alert.remote_task_id.nil())) {// Don't create task on alert if it already has one
			//rewriteing 'EvtMgmtIncidentHandler.createIncidentNoUpdate(gr, autoOpen)' content without using the 'locateRule' function
			var isRemoteIncident = EvtMgmtIncidentHandler.isRemoteIncidentURLDefined(); 
			//end of 'EvtMgmtIncidentHandler.createIncidentNoUpdate(gr, autoOpen)' logic
			if (alert.classification == '1' && ruleType != 'sn_si_incident') {
				gs.log("Trying to create a non-security incident attached to a security alert, createIncidentNoUpdate exiting.");
				createdIncident= false;
			}
			var autoOpen=true;
			var task=null;
			if (isRemoteIncident){
				createdIncident= EvtMgmtRemoteIncidentAdapter.createIncident(alert, ruleGR, ruleType, autoOpen);
			}else{
				task = new GlideRecord(ruleType);
				createdIncident= EvtMgmtIncidentHandler.submiteTask(alert, task, ruleGR, isRemoteIncident, ruleType, autoOpen);
			}

			if (createdIncident) {
				alert.update();
			}
			return task;
		}
		return null;
	} finally {
		mutex.release();
	}
};

EvtMgmtLegacyAlertRuleActions.applyAlertTemplate= function(ruleGR,alertGR){
	
	if (!ruleGR || ruleGR.overwrite_template.nil() || !ruleGR.overwrite_template.active) {
		return;
	}
	
	// apply template
	GlideTemplate.get(ruleGR.overwrite_template.sys_id).apply(alertGR);

	// add to work notes about the alert changes due to template overwriting
	var alertManager = new SNC.AlertManager();
	var ruleDisplayName = ruleGR.name.nil() ? ruleGR.sys_id : ruleGR.name;
	var uri = "[code]" + "<u>" + "<a href=\"" + "em_alert_management_rule.do?sys_id=" + ruleGR.sys_id + "\">"+ ruleDisplayName + "</a>"+ "</u>"+ "[/code]";	
	var worknotesMessage = gs.getMessage("This alert has been overwritten with alert template by the rule: {0}", uri);

	alertManager.updateWorkNotesOnAlert(alertGR, worknotesMessage);
	
	//applying the changes on the alert
	alertGR.update();
};

var EvtMgmtIncidentHandler = Class.create();
EvtMgmtIncidentHandler.prototype = {
	initialize: function() {
	},
	
	type: 'EvtMgmtIncidentHandler'
};
gs.include('EvtMgmtCustomIncidentPopulator');
gs.include('EvtMgmtRemoteIncidentAdapter');

/*
 * Locate em_alert_rule record and use the incident_template to create an task.
 * This method does an update on the alert record. 
 * @param alert - alert
 * @param autoOpen - are we looking for "auto open" rules
 */
EvtMgmtIncidentHandler.createIncident = function(alert, autoOpen) {

	var createdIncident = false;
	var mutex = new GlideSelfCleaningMutex('alert_'+alert.sys_id, 'EvtMgmtIncidentHandler');
	mutex.get();
	try {
		var gr = new GlideRecord('em_alert');
		gr.get(alert.sys_id);
		if (!gr.incident.nil() || !gr.remote_task_id.nil()) {
			return false; // Don't create task on alert if it already has one
		}
		createdIncident = EvtMgmtIncidentHandler.createIncidentNoUpdate(gr, autoOpen);
		if (createdIncident) {
			gr.update();
		}

	} finally {
		mutex.release();
		return false;
	}
	return createdIncident;

};

/*
 * Locate em_alert_rule record and use the incident_template to create an task.
 * This method does not update the alert record. 
 * @param alert - alert
 * @param autoOpen - are we looking for "auto open" rules
 */
EvtMgmtIncidentHandler.createIncidentNoUpdate = function(alert, autoOpen) {
	
	var rule = null;
	if (gs.getProperty('evt_mgmt.alert.management.enable_legacy_alert_action_rules','true') == 'true') {  // if property is turned on, used to disable legacy alert rules where not needed
		rule = EvtMgmtIncidentHandler.locateRule(alert, autoOpen);
	}
		
	var isRemoteIncident = EvtMgmtIncidentHandler.isRemoteIncidentURLDefined(); 
	
	// in auto open mode the rule shouls exist
	if (rule === null && autoOpen) {
		return false;
	}
	
	var ruleType;
	if (rule == null)
		ruleType = 'incident';
	else 
		ruleType = rule.type;
		
	if (!autoOpen && ruleType != 'incident') {
		gs.log("Trying to create a task that is not an incident, createIncidentNoUpdate exiting.");
		return false;
	}
	if (alert.classification == '1' && ruleType != 'sn_si_incident') {
		gs.log("Trying to create a non-security incident attached to a security alert, createIncidentNoUpdate exiting.");
		return false;
	}
	var task;
	if (isRemoteIncident){
		return EvtMgmtRemoteIncidentAdapter.createIncident(alert, rule, ruleType, autoOpen);
	}
	else{
		task = new GlideRecord(ruleType);
		return EvtMgmtIncidentHandler.submiteTask(alert, task, rule, isRemoteIncident, ruleType, autoOpen);
	}
	

};


	
/*
*  fills and creates the task
*/
EvtMgmtIncidentHandler.submiteTask = function(alert, task, rule, isRemoteIncident, ruleType, autoOpen) {
		
	task.initialize();
	
	// alert shows Description, while Incident shows Short Description
	// Therefore we are going to copy Description of Alert into 
	//           Short Description of Incident

	// alert Severity is 0-5 (Clear, Critical, … Info) 
	//           while Incident severity is 1-3 (High, Medium, Low)
	// Therefore we are going to map 1 to 1, 2 to 2 
	//           and the rest Alert Severities (3,4,5,0) to 3 (Low)

	task.setValue('short_description', alert.description);
	task.setValue('description', alert.description);
	task.setValue('cmdb_ci', alert.cmdb_ci);
	task.setValue('caller_id', '9d5de9e5930022005bc5f179077ffb07'); //set caller to be Event Management
	task.setValue('origin_id', alert.sys_id);
	task.setValue('origin_table', 'em_alert');

	if (ruleType == 'incident' && autoOpen) {
		//In case the incident was opened due to alert rule, define the caller of the incident to Event Management user and the contact type as Alert
		task.setValue('caller_id', "9d5de9e5930022005bc5f179077ffb07");
		task.setValue('contact_type', "Alert");
	}
	
	var taskSeverity = (alert.severity == 2 || alert.severity == 1 ) ?  alert.severity : '3';
	task.setValue('urgency', taskSeverity);
	
	if (rule != null && !rule.incident_template.nil() && rule.incident_template.active) {
		if (!isRemoteIncident) {
			GlideTemplate.get(rule.incident_template.sys_id).apply(task);	
		}
		else {
			// we ignore rule templates in remote incident creation
			gs.warn("EvtMgmtIncidentHandler: in remote incident creation flow the template on rule " + rule.name + " was ignored");
		}
	}

	var createIncident = false;
    try    {
        createIncident = EvtMgmtCustomIncidentPopulator.populateFieldsFromAlert(alert, task, rule);
    } catch(err){
        gs.error('EvtMgmtIncidentHandler: Error-->' + err);
    }

	if (createIncident == false) { 
		gs.addInfoMessage(gs.getMessage("Incident creation was aborted by customized EvtMgmtCustomIncidentPopulator script"));	
		return false;
	}
	
	var taskId = task.insert();
	if (taskId === null) {
		gs.addErrorMessage(gs.getMessage("Failed to create incident. Msg: {0}", [task.getLastErrorMessage()]));
		return false;
	}
	
	task.initialize();
	task.get(taskId);

	gs.log("Task " + task.getValue('number') + " created for alert " + alert.number + ".");
	
	// update alert fields
	if (rule != null) {
		var ruleDisplayName = rule.name.nil() ? rule.sys_id : rule.name;
		var uri = "[code]" + "<u>" + "<a href=\"" + rule.getTableName() + ".do?sys_id=" + rule.sys_id + "\">"+ ruleDisplayName + "</a>"+ "</u>"+ "[/code]";	
		var alertManager = new SNC.AlertManager();
		alertManager.updateWorkNotesOnAlert(alert, gs.getMessage('Task {0} created using Alert rule: {1}', [task.getValue('number'), uri]));
	}
	
	if (isRemoteIncident){
		alert.remote_task_id = task.getValue('number');
	}
	else{
		alert.incident = taskId;
	}
	return true;	
};

/*
 * Locate em_alert_rule record
 * @param alert - alert
 * @param autoOpen - are we looking for "auto open" rules
 */
EvtMgmtIncidentHandler.locateRule = function(alert, autoOpen) {
	var ci = new GlideRecord('cmdb_ci');
	ci.get(alert.cmdb_ci);
	var gr = new GlideRecord("em_alert_rule");
	gr.addActiveQuery();
	gr.orderBy('order');
	if (autoOpen) {
		gr.addQuery('auto_open', true);
	}
	gr.query();
	while (gr.next()) {
		if (GlideFilter.checkRecord(alert, gr.alert_filter)) {
			return gr;
		}
	}
	return null;
};

/*
 * checks does the URL for remote incident repository defined
 */
EvtMgmtIncidentHandler.isRemoteIncidentURLDefined = function() {
		var remoteUrl = GlideProperties.get("evt_mgmt.remote_incident_url");
		return (remoteUrl != null && remoteUrl.trim() != "");

};

/*
 * returns the URL for remote incident repository 
 */
EvtMgmtIncidentHandler.getRemoteIncidentURL = function() {
		return GlideProperties.get("evt_mgmt.remote_incident_url");
};

/*
 * sets basic auth based on credentials that were 
 * defined to access the remote incident repository defined
 */
EvtMgmtIncidentHandler.setBasicAuth = function(remoteGlideRecord) {
		var credentialsName = GlideProperties.get("evt_mgmt.remote_incident_credentials");
		var credentials = new GlideRecord('discovery_credentials');
		credentials.addQuery('name', '=', credentialsName);
		credentials.query();
		var remoteCredentials = {};
		credentials.next();
		remoteCredentials['user_name'] = credentials.getValue('user_name');

		var pwd = credentials.getElement("password");
		remoteCredentials['password'] =  pwd.getDecryptedValue();
	
		remoteGlideRecord.setBasicAuth(remoteCredentials['user_name'],
									   remoteCredentials['password']);
};

var EvtMgmtRemoteIncidentAdapter = Class.create();
EvtMgmtRemoteIncidentAdapter.prototype = {
    initialize: function() {},

    type: 'EvtMgmtRemoteIncidentAdapter'
};

gs.include('EvtMgmtIncidentHandler');

/*
 * Locate em_alert_rule record and use the incident_template to create an task.
 * This method does an update on the alert record. 
 * @param alert - alert
 * @param rule - alert rule for incident creation
 * @param taskType - incident", "task" etc  
 */
EvtMgmtRemoteIncidentAdapter.createIncident = function(alert, rule, taskType, autoOpen) {
    var task = new GlideRemoteGlideRecord(EvtMgmtIncidentHandler.getRemoteIncidentURL(), taskType);
    EvtMgmtIncidentHandler.setBasicAuth(task);
    return EvtMgmtIncidentHandler.submiteTask(alert, task, rule, true, taskType, autoOpen);

};

EvtMgmtRemoteIncidentAdapter.createdIncidentFromJSON = function(jsonObject) {
    var incident0 = new GlideRemoteGlideRecord(EvtMgmtIncidentHandler.getRemoteIncidentURL(), 'incident');
    EvtMgmtIncidentHandler.setBasicAuth(incident0);
    for (var prop in jsonObject) {
        incident0.setValue(prop, jsonObject[prop]);
    }
    var taskId = incident0.insert();
    return taskId;

};

EvtMgmtRemoteIncidentAdapter.closeResolvedAlerts = function() {
    var alert = new GlideRecord('em_alert');
    alert.addQuery('state', '!=', 'Closed');
    alert.addQuery('severity', '!=', '5');
    alert.addNotNullQuery('remote_task_id');
    alert.query();
    var incident = new GlideRemoteGlideRecord(EvtMgmtIncidentHandler.getRemoteIncidentURL(), 'incident');

    EvtMgmtIncidentHandler.setBasicAuth(incident);

    incident.initialize();
    var incidentNumbers = "";
    var alertSysId2RemoteTask = {};
    while (alert.next()) {
        incidentNumbers += alert.getValue('remote_task_id');
        incidentNumbers += ",";
        alertSysId2RemoteTask[alert.getValue('sys_id')] = alert.getValue('remote_task_id');
    }
    incidentNumbers = incidentNumbers.substring(0, incidentNumbers.length - 1);
    incident.addQuery('state', 'IN', '6,7');
    incident.addQuery('number', 'IN', incidentNumbers);
    incident.query();
    var remoteTaskIds = {};
    while (incident.next()) {
        remoteTaskIds[incident.getValue('number')] = 1;
    }
    for (var alertSysId in alertSysId2RemoteTask) {
        if (remoteTaskIds[alertSysId2RemoteTask[alertSysId]] === 1) {
            alert.initialize();
            alert.get(alertSysId);
            alert.setValue('state', 'Closed');
            var alertManager = new SNC.AlertManager();
            alertManager.updateWorkNotesOnAlert(alert, 'Closing alert because the related incident is already Resolved or Closed');
            alertManager.setClosureReason("Incident resolved");
            alert.update();
        }
    }

};

// This rule runs when the alert is closed.
// It will resolve, or close the associated task or just add a comment to it
// (checks the property alert_closes_incident)
var alertManager = new SNC.AlertManager();
alertManager.addStep("Alert BR: Close associated incident (after)");

var task = new GlideRecord("task");
var isCurrentIncidentFound = task.get(current.incident);
if (isCurrentIncidentFound)  {
var taskState = task.state;
// Incident is not Resolved or Closed
if ("6" != taskState && "7" != taskState) {
	// Check there are no alerts linked to this task that are not closed
	var relatedAlerts = new GlideRecord("em_alert");
	relatedAlerts.addQuery("state", "!=", "Closed");
	relatedAlerts.addQuery("severity", "!=", "5");
	relatedAlerts.addQuery("severity", "!=", "0");
	relatedAlerts.addQuery("incident", current.incident);
	relatedAlerts.addQuery("sys_id", "!=", current.sys_id); // skip the current alert
	relatedAlerts.query();
	if (relatedAlerts.getRowCount() == 0) {
		var property = gs.getProperty('evt_mgmt.alert_closes_incident');
		var stateInt;
		if (property == 'resolve') {
			stateInt = 2;
		} else if (property == 'close') {
			stateInt = 3;
		} else if (property == 'nothing') {
			stateInt = 0;
		}
		//check if the type has special behavior or handle as a task
		var type;
		var taskTypeChoicesGr = new GlideRecord("em_task_type_choices");
		taskTypeChoicesGr.addQuery("type", task.sys_class_name);
		taskTypeChoicesGr.query();
		if (!taskTypeChoicesGr.next())
			type = "task";
		else {
			type = task.sys_class_name;
		}
		
		//get the mapping value for the required type
	//	var stateGr = new GlideRecord("em_task_type_choices");
		taskTypeChoicesGr.initialize();
		taskTypeChoicesGr.addQuery("type", type);
		taskTypeChoicesGr.addQuery("state", stateInt);
		taskTypeChoicesGr.query();
		if (taskTypeChoicesGr.next()) {
			var value = taskTypeChoicesGr.getValue('value');
			if (value != "-1") {
				if (type == "incident" && (value == IncidentState.RESOLVED || value == IncidentState.CLOSED)) {
					var incGr = new GlideRecord("incident");
					incGr.get(task.getUniqueValue());
					task = incGr;
					task.close_code = gs.getMessage("Solved Remotely (Permanently)");
					task.close_notes = gs.getMessage("Closed the task associated with alert: {0}", current.number);
					var taskCiGR = new GlideRecord('task_ci');
					//check for HAM Installed by asset_action field check & making sure cmdb_ci has asset field not empty
					if (taskCiGR.isValidField('asset_action') && task.cmdb_ci != '' && task.cmdb_ci.asset != '') {
						updateAssetAction(task.cmdb_ci, task.getUniqueValue());
					}
				}
				task.state = value;
				task.update();
			}
		}
	}
}
}

function updateAssetAction(ci, task) {
	var taskCiGR = new GlideRecord('task_ci');
	taskCiGR.addQuery('ci_item', ci);
	taskCiGR.addQuery('task', task);
	taskCiGR.addNullQuery('asset_action');
	taskCiGR.setLimit(1);
	taskCiGR.query();
	if (taskCiGR.next()) {
		taskCiGR.setValue('asset_action', 'update_repair');
		taskCiGR.update();
	}
}

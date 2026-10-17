(function executeRule(current, previous /*null when async*/) {
	try {

		var alerts = [];

		var alertManager = new SNC.AlertManager();
		alertManager.addStep("Alert BR: Trigger Priority calculation (before)");
		var isThreadProcessingEvents = alertManager.isThreadProcessingEvents();
		if(isThreadProcessingEvents) {
			// If the alert is changed while event processing, we run only the severity change handling
			if (current.severity !=  previous.severity && previous.severity != "5") {
				alertManager.addStep("Alert BR: Trigger Priority calculation (before) updatePriorityBySeverity");
				updatePriorityBySeverity(current, isThreadProcessingEvents);
			}
			var shouldACRParentBeUpdated = gs.getProperty('evt_mgmt.sn_em_tbac_update_priority_of_acr_parent', 'true') == 'true';
			var currentClosedPrevOpen = current.state == "Closed" && previous.state != "Closed" && gs.getProperty("evt_mgmt.calculate_priority_for_parent_when_alert_closes_via_event", "true") === "true";
			if (shouldACRParentBeUpdated && current.operation() != "insert" && (current.correlation_group != previous.correlation_group || current.
			parent != previous.parent || currentClosedPrevOpen)) {
				addParentToArray(alerts, current);
				checkAndAdd2Queue(alerts);
			}
			return;
		} else {
			// Manual change of alert
			var alerts = [];
			if (current.operation() == "insert") {
				updateArray(alerts, current);
				
			} else if (current.severity !=  previous.severity) {
				if (previous.severity == "5")
					updateArray(alerts, current);
				else {
					alertManager.addStep("Alert BR: Trigger Priority calculation (before) updatePriorityBySeverity");
					updatePriorityBySeverity(current, isThreadProcessingEvents);

					return;
				}
				
			} else if (current.state == "Closed" && previous.state != "Closed") {
				addParentToArray(alerts, previous);
				
			} else if (current.state !=  previous.state && previous.state == "Closed") {
				updateArray(alerts, current);
				
			} else if (current.correlation_group !=  previous.correlation_group || current.parent !=  previous.parent) {
				updateArray(alerts, current);
				
			} else if (current.cmdb_ci !=  previous.cmdb_ci) {
				updateArray(alerts, current);
				
			} else {
				return;
			}
			
			alertManager.addStep("Alert BR: Trigger Priority calculation (before) checkAndAdd2Queue");
			checkAndAdd2Queue(alerts);
		}
		
	} catch(e) {
		gs.logError("Business rule 'Update alert trigger queue' failed for alert record " + current.sys_id + " - " + e);
	}
	
})(current, previous);

function updateArray(alerts, current) {
	alerts.push(current.getUniqueValue());
	addParentToArray(alerts, current);
}

function addParentToArray(alerts, current) {
	if (current.getValue("parent") == null || current.getValue("parent") == "" || current.getValue("parent") == "NULL")
		return;
	var parent = String(current.getValue("parent"));
	alerts.push(parent);
	
	// Use extra data to identify GoG alerts
	if (current.getValue('sn_extra_data')) {
		var grandParent = current.parent.parent;
		if (grandParent && alerts.indexOf(grandParent) === -1) {
			alerts.push(grandParent);
		}
	}
}

function updatePriorityBySeverity(current, isThreadProcessingEvents) {
	var priority = current.getValue("sn_priority");
	var priorityJson = JSON.parse(current.getValue("priority_json"));
	if(!priorityJson || typeof priorityJson === 'undefined') { // This might happen while upgrade to K
		if (this.isDebugEnabled()) 
			gs.warn("Trigger Priority calculation BR: cannot parse alert (" + current.sys_id + ") priority_json field to JSON:  " + current.getValue("priority_json"));
		
		//we want to add the alert to the queue for full calculation to resolve race condition 
		//when the priority (of create event) already in the middle of the calculation by priority calculation job,
		//but the Json (of updated event) is still empty.
		//When the BR run from Event Processing job, it is done by the job itself after the alert is saved to DB.
		if(!isThreadProcessingEvents) //only in manual change
			add2Queue(current.getUniqueValue());
		return;
	}
	
	for (var i = 0; i< priorityJson.length; i++) {
		if (priorityJson[i].category === "severity") {
			var score = priorityJson[i].score;
			var weight = priorityJson[i].weight;
			var currentSeverity = current.getValue("severity");
			
			var valueAfterMapping = priorityJson[i].mapping[currentSeverity];
			
			// calculate the new priority (decrease the previous severity and increase the new severity)
			priority = priority - (score * weight) + (valueAfterMapping * weight);
			
			//update the priority JSON with the new mapped severity
			priorityJson[i].score = valueAfterMapping;
			var priorityJsonStr = JSON.stringify(priorityJson);
			
			current.setValue("sn_priority", priority);
			current.setValue("priority_json", priorityJsonStr);

			var alertManager = new SNC.AlertManager();
			alertManager.addStep("Alert BR: Trigger Priority calculation (before) getPriorityBreakdownForAlert");
			var priorityBreakdown = alertManager.getPriorityBreakdownForAlert(current);
			break;
		}
	}
	
}

function checkAndAdd2Queue(alerts) {
	for (var i = 0; i < alerts.length; i++) {
		//add record to queue
		var gr = new GlideRecord('em_alert_trigger_queue');
		gr.addQuery('alert', alerts[i]);
		gr.addQuery('state', 'pending');
		gr.setLimit(1);
		gr.query();
		if (!gr.next()) {
			add2Queue(alerts[i]);
		}
	}
}

function add2Queue(alert) {
	var gr = new GlideRecord('em_alert_trigger_queue');
	gr.setValue('alert', alert);
	gr.insert();
}

function isDebugEnabled() {
	return (gs.getProperty('evt_mgmt.log_debug', 'false') == 'true');
}

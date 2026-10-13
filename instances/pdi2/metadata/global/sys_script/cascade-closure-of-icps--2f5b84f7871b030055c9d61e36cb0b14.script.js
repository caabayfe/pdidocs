(function executeRule(current, previous) {

	var incidentSysId = current.sys_id;
	var incDisplayValue = current.getDisplayValue();
	var IA_INACTIVE_STATES = "cancelled,closed";
	var IA_CLOSED_STATE = "closed";
	var IA_CANCELLED_STATE = "cancelled";
	var incidentAlertGr = new GlideRecord("incident_alert");
	incidentAlertGr.addQuery("source_incident", incidentSysId);
	incidentAlertGr.addQuery("state", "NOT IN", IA_INACTIVE_STATES);
	incidentAlertGr.query();
	onIncidentStateChange(incidentAlertGr, current.state);

	function onIncidentStateChange(incAlertGr, state) {
		while(incAlertGr.next()) {
			var msg;
			var IAState = incAlertGr.getValue("state");
			if(IAState == "new" || IAState == "work_in_progress") {
				if(state == IncidentState.CLOSED)
					msg = gs.getMessage("Incident Communication Plan is Canceled based on closure of {0}", incDisplayValue);
				else if(state == IncidentState.CANCELED)
					msg = gs.getMessage("Incident Communication Plan is Canceled based on cancelation of {0}", incDisplayValue);
				incAlertGr.work_notes = msg;
				incAlertGr.setValue("state", IA_CANCELLED_STATE);
				incAlertGr.update();
			}
			else if (IAState == "open") {
				if(state == IncidentState.CLOSED) {
					msg = gs.getMessage("Incident Communication Plan is Closed based on closure of {0}", incDisplayValue);
					incAlertGr.setValue("state", IA_CLOSED_STATE);
				}
				else if(state == IncidentState.CANCELED) {
					msg = gs.getMessage("Incident Communication Plan is Canceled based on cancelation of {0}", incDisplayValue);
					incAlertGr.setValue("state", IA_CANCELLED_STATE);
				}

				incAlertGr.work_notes = msg;
				incAlertGr.update();
			}
			else if(IAState == "resolved") {
				if(state == IncidentState.CLOSED)
					msg = gs.getMessage("Incident Communication Plan is Closed based on closure of {0}", incDisplayValue);
				else if(state == IncidentState.CANCELED)
					msg = gs.getMessage("Incident Communication Plan is Closed based on cancelation of {0}", incDisplayValue);
				incAlertGr.work_notes = msg;
				incAlertGr.setValue("state", IA_CLOSED_STATE);
				incAlertGr.update();
			}
		}
	}
})(current, previous);

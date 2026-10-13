(function executeRule(current, previous) {

	var CLOSED_STATE = "closed";
	var CANCELLED_STATE = "cancelled";
	var COMPLETE_ACTION = "Complete";
	var SKIPPED_ACTION = "Skipped";
	var incAlertSysId = current.sys_id;
	var incAlertDisplayValue = current.getDisplayValue();
	var incAlTaskGr = new GlideRecord("incident_alert_task");
	incAlTaskGr.newRecord();
	var taskStateUtil = new TaskStateUtil(incAlTaskGr);
	var INACTIVE_STATES = taskStateUtil.getInactiveStates() || taskStateUtil.SYSTEM_INACTIVE_STATES;
	var incAlertTaskGr = new GlideRecord('incident_alert_task');
	incAlertTaskGr.addActiveQuery();
	incAlertTaskGr.addQuery("incident_alert", incAlertSysId);
	incAlertTaskGr.addQuery("state", "NOT IN", INACTIVE_STATES);
	incAlertTaskGr.addNullQuery('last_communication');
	incAlertTaskGr.query();
	onStateChange(current.state, incAlertTaskGr, SKIPPED_ACTION);

	var incATaskGr = new GlideRecord('incident_alert_task');
	incATaskGr.addQuery("incident_alert", incAlertSysId);
	incATaskGr.addQuery("state", "NOT IN", INACTIVE_STATES);
	incATaskGr.addNotNullQuery('last_communication');
	incATaskGr.query();
	onStateChange(current.state, incATaskGr, COMPLETE_ACTION);

	function onStateChange(state, gr, action) {
		var SKIPPED_STATE = 7;
		var COMPLETE_STATE = 3;
		var finalState;
		if (action == SKIPPED_ACTION)
			finalState = SKIPPED_STATE;
		else
			finalState = COMPLETE_STATE;
		while (gr.next()) {
			var msg;
			if (state == CLOSED_STATE) {
				if (action == SKIPPED_ACTION)
					msg = gs.getMessage("Incident Communication Task is Skipped based on closure of {0}", incAlertDisplayValue);
				else
					msg = gs.getMessage("Incident Communication Task is Complete based on closure of {0}", incAlertDisplayValue);
			} else if (state == CANCELLED_STATE) {
				if (action == SKIPPED_ACTION)
					msg = gs.getMessage("Incident Communication Task is Skipped based on cancelation of {0}", incAlertDisplayValue);
				else
					msg = gs.getMessage("Incident Communication Task is Complete based on cancelation of {0}", incAlertDisplayValue);
			}
			gr.work_notes = msg;
			gr.setValue("state", finalState);
			gr.update();
		}
	}
})(current, previous);

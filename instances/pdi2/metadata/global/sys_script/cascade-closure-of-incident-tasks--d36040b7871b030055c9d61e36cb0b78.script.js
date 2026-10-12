(function executeRule(current, previous) {

	var incidentSysId = current.sys_id;
	var incDisplayValue = current.getDisplayValue();
	var incTaskGrDefault = new GlideRecord("incident_task");
	incTaskGrDefault.initialize();
	var taskStateUtil = new TaskStateUtil(incTaskGrDefault);
	var INACTIVE_STATES = taskStateUtil.getInactiveStates() || taskStateUtil.SYSTEM_INACTIVE_STATES;
	var incTaskGr = new GlideRecord("incident_task");
	incTaskGr.addActiveQuery();
	incTaskGr.addQuery("incident", incidentSysId);
	incTaskGr.addQuery("state", "NOT IN", INACTIVE_STATES);
	incTaskGr.query();
	if(current.state == IncidentState.CLOSED)
		closeOpenIncidentTasks();
	else if(current.state == IncidentState.CANCELED)
		cancelOpenIncidentTasks();

	function closeOpenIncidentTasks() {
		var CLOSED_INCOMPLETE_STATE = 4;
		while(incTaskGr.next()) {
			incTaskGr.work_notes = gs.getMessage("Incident Task is Closed Incomplete based on closure of {0}.", incDisplayValue);
			incTaskGr.setValue("state", CLOSED_INCOMPLETE_STATE);
			incTaskGr.update();
		}
	}

	function cancelOpenIncidentTasks() {
		var CLOSED_SKIPPED_STATE = 7;
		while(incTaskGr.next()) {
			incTaskGr.work_notes = gs.getMessage("Incident Task is Closed Skipped based on cancelation of {0}.", incDisplayValue);
			incTaskGr.setValue("state", CLOSED_SKIPPED_STATE);
			incTaskGr.update();
		}
	}

})(current, previous);

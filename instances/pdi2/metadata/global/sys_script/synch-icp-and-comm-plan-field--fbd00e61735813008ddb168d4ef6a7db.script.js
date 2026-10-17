(function executeRule(current, previous /*null when async*/) {
	if(current.incident_alert.changes())
		current.comm_plan = current.incident_alert;
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	var pirManager = new PIRManager();
	var incidentSysId = current.incident;
	pirManager.updateSystemGeneratedEvent(incidentSysId);
})(current, previous);

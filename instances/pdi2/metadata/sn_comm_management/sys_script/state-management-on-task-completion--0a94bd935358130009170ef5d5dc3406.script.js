(function executeRule(current, previous /*null when async*/) {
	var handlerInstance;
	if (current.comm_plan && current.comm_plan.source)
		handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstance(current.comm_plan.source.getRefRecord().getRecordClassName());
	else if (current.getRecordClassName() == 'incident_alert_task') {
		//Special handling for incident_alert. Here traditionaly source was not mandatory.
		handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstance('incident');
	}
	handlerInstance.onCommTaskCompletion(current, previous);
})(current, previous);

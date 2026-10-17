(function executeRule(current, previous /*null when async*/) {
	var sourceRecord = current.source.getRefRecord();
	var cph = new CommunicationManagementBridgeSNC().getHandlerInstance(sourceRecord.getRecordClassName());
	cph.updatePlanDetails(current.comm_plan_definition.getRefRecord(), current, sourceRecord);
	cph.createCommunicationTasks(sourceRecord, current);
	cph.createContactsFromContactDefinition(current);
})(current, previous);

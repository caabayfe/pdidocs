(function executeRule(current, previous /*null when async*/) {

	var source = current.comm_plan.source;
	var taskDefinition = current.comm_task_definition;
	var taskType = current.comm_task_type;
	//validating source and task definition
	if(taskDefinition) {
	var planDefinition = taskDefinition.comm_plan_definition;
		if(((source.getRefRecord().getRecordClassName()) != planDefinition.table) || !source || !(taskDefinition.active)) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Invalid choice of Communication task definition'));
		}
	}
	//validating source and type
	else if(taskType) {
		if(((taskType.table)&&(source.getRefRecord().getRecordClassName()) != taskType.table) || !source || !(taskType.active)) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Invalid choice of type'));
		}
	}
})(current, previous);

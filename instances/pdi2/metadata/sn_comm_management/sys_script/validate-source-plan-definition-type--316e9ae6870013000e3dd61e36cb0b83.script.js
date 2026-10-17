(function executeRule(current, previous /*null when async*/) {

	var source = current.source;
	var planDefinition = current.comm_plan_definition;
	var planType = current.comm_plan_type;
	//validating source and plan definition
	if(planDefinition) {
		if(((source.getRefRecord().getRecordClassName()) != planDefinition.table) || !source || !(planDefinition.active)) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Invalid combination of source and communication plan definition'));
		}
	}
	//validating source and type
	else if(planType) {
		if(((planType.table) && (source.getRefRecord().getRecordClassName()) != planType.table)|| !source|| !(planType.active)) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Invalid combination of source and type'));
		}
	}
})(current, previous);

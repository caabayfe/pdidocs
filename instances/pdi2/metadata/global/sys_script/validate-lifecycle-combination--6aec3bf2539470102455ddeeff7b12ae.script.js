(function executeRule(current, previous /*null when async*/) {
	if(!current.life_cycle_stage  && !current.life_cycle_stage_status)
		return;

	var util = new LifeCycleUtil();
	
	/*
		If sys_id values are used as an update payload, this BR should look those up on the stage and stage status
		table and change the field value to the correct "name" alternate reference key, if the id resolves to a record.
	*/
	if(util._isSysId(current.life_cycle_stage)){
		var stageRef = util.convertIdToName(current.life_cycle_stage, 'life_cycle_stage');
		current.life_cycle_stage = stageRef;
	}
	if(util._isSysId(current.life_cycle_stage_status)){
		var stageStatusRef = util.convertIdToName(current.life_cycle_stage_status, 'life_cycle_stage_status');
		current.life_cycle_stage_status = stageStatusRef;
	}


	if (!util._validateCombination(current)) {
		gs.addErrorMessage(gs.getMessage('Invalid Life Cycle Stage and Stage Status combination'));
		current.setAbortAction(true);
	} else {
		/* 
			life cycle stage and status are of type 'Translated Text', thus value updatation to a reference field isn't possible as the values doesn't match with any available record
			when session language is set to any language other than english.
			so need to retrieve sysId based on displayValue of stage and status to update the current object values.
		*/
		var needsStageTranslation = current.life_cycle_stage.sys_id == undefined;
		var needsStatusTranslation = current.life_cycle_stage_status.sys_id == undefined;

		if (needsStageTranslation) {
			var lifeCycleStageGr = new GlideRecord("life_cycle_stage");
			lifeCycleStageGr.query();
			while (lifeCycleStageGr.next()){
				if (lifeCycleStageGr.getDisplayValue('name') == current.life_cycle_stage) {
					current.life_cycle_stage = lifeCycleStageGr.getValue('name');
					break;
				}
			}
		}
	
		if (needsStatusTranslation) {
			var lifeCycleStageStatusGr = new GlideRecord("life_cycle_stage_status");
			lifeCycleStageStatusGr.query();
			while (lifeCycleStageStatusGr.next()){
				if (lifeCycleStageStatusGr.getDisplayValue('name') == current.life_cycle_stage_status) {
					current.life_cycle_stage_status = lifeCycleStageStatusGr.getValue('name');
					break;
				}
			}
		}
	}

})(current, previous);

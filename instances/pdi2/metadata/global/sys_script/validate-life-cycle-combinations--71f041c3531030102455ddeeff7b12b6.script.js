(function executeRule(current, previous /*null when async*/) {
	if(!current.life_cycle_stage  && !current.life_cycle_stage_status)
		return;
	
	var util = new LifeCycleUtil();
	if(!util._validateCombination(current)){
		gs.addErrorMessage(gs.getMessage('Invalid Life Cycle Stage and Stage Status combination'));
		current.setAbortAction(true);
	}

})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	if(gs.nil(current.model))
		current.setAbortAction(true);
	current.model_table = 'sys_decision';
	current.model_id = current.model.sys_id;
	
})(current, previous);

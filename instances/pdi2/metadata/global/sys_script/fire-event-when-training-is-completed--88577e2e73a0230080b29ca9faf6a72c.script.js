(function executeRule(current, previous /*null when async*/) {
	
	var userSysId = getSysIdForTrainingCreator(current);
    if (current.state == 'solution_error' || current.state == 'timed_out') {
        gs.eventQueue('ml_solution.training.failure', current, userSysId);
    } else if (current.state == 'solution_complete') {
        gs.eventQueue('ml_solution.training.successful', current, userSysId);
    }
	
})(current, previous);

function getSysIdForTrainingCreator(current) {
	var userSysId = null;
	var gr = new GlideRecord('ml_training_request_schedule');
	gr.addQuery('ml_capability_definition', current.ml_capability_definition);
	gr.query();
	if (gr.next()) {
		var sysUserGr = new GlideRecord('sys_user');
		sysUserGr.addQuery('user_name', gr.getValue('sys_created_by'));
		sysUserGr.query();
		if (sysUserGr.next()) {
			userSysId = sysUserGr.getValue('sys_id');
		}
	}
	return userSysId;
}

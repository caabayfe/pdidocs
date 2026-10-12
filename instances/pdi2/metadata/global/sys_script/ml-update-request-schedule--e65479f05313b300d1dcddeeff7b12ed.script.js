(function executeRule(current, previous /*null when async*/) {
	new MLRequestSchedule().deleteExistingUpdateRequestSchedule(current.sys_id);
	new MLRequestSchedule().insertUpdateRequestSchedule(current.sys_id, current.solution_name, current.update_frequency.toString());

})(current, previous);

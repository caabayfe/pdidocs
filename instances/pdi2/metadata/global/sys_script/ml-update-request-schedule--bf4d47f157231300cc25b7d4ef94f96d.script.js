(function executeRule(current, previous /*null when async*/) {
	var name = current.trainer.name;
	if (name == 'similarity_trainer' || name == 'clustering_trainer') {
		new MLRequestSchedule().deleteExistingUpdateRequestSchedule(current.sys_id);
		new MLRequestSchedule().insertUpdateRequestSchedule(current.sys_id, current.solution_name, current.update_frequency.toString());
	}

})(current, previous);

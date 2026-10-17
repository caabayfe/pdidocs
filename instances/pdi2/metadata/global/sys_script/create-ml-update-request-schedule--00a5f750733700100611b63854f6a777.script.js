(function executeRule(current, previous /*null when async*/) {
	var solDef = new MLGroupbyUtils().getGlideRecord(current.ml_capability_definition);
	new MLRequestSchedule().deleteExistingUpdateRequestSchedule(solDef.sys_id);
	new MLRequestSchedule().insertUpdateRequestSchedule(solDef.sys_id, solDef.solution_name, solDef.update_frequency.toString());

})(current, previous);

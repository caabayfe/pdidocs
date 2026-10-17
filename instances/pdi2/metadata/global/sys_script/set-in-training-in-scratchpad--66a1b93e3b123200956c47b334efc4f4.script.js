(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.latest_ml_solution_state_in_training = new MLRequestSchedule().isSolutionCurrentlyTraining(current.sys_id) + "";
})(current, previous);

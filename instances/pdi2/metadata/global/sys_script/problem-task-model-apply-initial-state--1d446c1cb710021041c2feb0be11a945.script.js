(function executeRule(current, previous /*null when async*/) {

	if (!current.isNewRecord())
		return;

	// Sync the type on display
	current.setValue("problem_task_type", current.prb_task_model.prb_task_type + "");

	var problemTask = new ProblemTask(current);
	current.setValue(problemTask.getStateFieldName(), problemTask.getInitialState());

})(current, previous);

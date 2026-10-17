(function executeRule(current, previous /*null when async*/ ) {
  
	if (current.problem.prb_model.nil()) {
		current.setValue("prb_task_model", "");
		return;
	}

	if (current.problem_task_type + "" === "model")
		return;

	if (!current.prb_task_model.nil())
		current.setValue("problem_task_type", current.prb_task_model.prb_task_type + "");
  })(current, previous);

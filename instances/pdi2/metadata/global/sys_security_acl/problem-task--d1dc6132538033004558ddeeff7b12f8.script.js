answer = true;
if (pm.isActive('com.snc.best_practice.problem.madrid.state_model')) {
	if (current.state == ProblemTaskState.States.CLOSED)
		answer = false;
}

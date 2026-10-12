answer = true;
if (pm.isActive('com.snc.best_practice.problem.madrid.state_model')) {
	if (new ProblemStateUtils().isClosed(current))
		answer = false;
}

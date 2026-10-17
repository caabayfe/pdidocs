(function executeRule(current, previous /*null when async*/) {
	// If the step environment is UI and the user is not maint
	if (current.step_env.changes() &&
		current.step_env == "d2cb02e1870312009dccc9ded0e3ec7c" &&
		!gs.getUser().hasRole("maint")) {
		current.step_env.setError(gs.getMessage("Only users with maint role can set the step environment to UI"));
		current.setAbortAction(true);
	}
})(current, previous);

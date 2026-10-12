(function executeRule(current, previous /*null when async*/) {

	var time = gs.nowDateTime();
	var user = gs.getUserID();
	current.resolved_at = time;
	current.resolved_by = user;

	if (current.resolution_code == ProblemState.RESOLUTION_CODES.RISK_ACCEPTED) {
		current.closed_at = time;
		current.closed_by = user;
	}
})(current, previous);

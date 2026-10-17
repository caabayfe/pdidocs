(function executeRule(current, previous /*null when async*/) {
	var prev = previous.last_run_date;
	if (!gs.nil(prev)) {
		current.prev_last_run_date = previous.last_run_date;
	}
})(current, previous);

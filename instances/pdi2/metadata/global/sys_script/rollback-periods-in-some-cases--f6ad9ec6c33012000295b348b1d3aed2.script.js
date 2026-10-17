(function executeRule(current, previous /*null when async*/) {

	if (current.isNewRecord()) {
		current.score_periods = -1;
		current.snapshot_periods = -1;
	}
	
	else {
		current.score_periods = previous.score_periods;
		current.snapshot_periods = previous.snapshot_periods;
	}

})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	var STATE_CLOSE_COMPLETE = 3;
	var STATE_CLOSE_INCOMPLETE = 4;
	var STATE_CLOSE_SKIPPED = 7;

	var state = current.getValue('state') * 1;

	if (state === STATE_CLOSE_COMPLETE)
		current.close_code = 'successful';
	else if (state === STATE_CLOSE_INCOMPLETE)
		current.close_code = 'successful_issues';
	else if (state === STATE_CLOSE_SKIPPED)
		current.close_code = 'unsuccessful';

})(current, previous);

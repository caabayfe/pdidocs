(function executeRule(current, previous /*null when async*/) {
	// set or clear retired_date
	if ('RETIRED'.equals(current.status)) {
		current.retired_date = gs.nowDateTime();
	} else {
		current.retired_date = '';
	}

})(current, previous);

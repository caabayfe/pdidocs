(function executeRule(current, previous /*null when async*/) {
	if (new OCRotaICalendar().coverageLimitExceeded(current))
		current.setAbortAction(true);
})(current, previous);

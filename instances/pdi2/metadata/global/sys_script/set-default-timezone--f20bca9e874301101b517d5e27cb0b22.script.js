(function executeRule(current, previous /*null when async*/) {
	
	current.run_as_tz = gs.getSysTimeZone();
	
})(current, previous);

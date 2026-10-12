(function executeRule(current, previous /*null when async*/) {

	// Trigger comparison generation on insert (this is asynchronous so it won't block the insert)
	sn_atf.PerformanceAPI.generateComparison(current.getUniqueValue());

})(current, previous);

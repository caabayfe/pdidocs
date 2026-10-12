(function executeRule(current, previous /*null when async*/) {
	// Prevent records to be flagged as benchmarking when using the UI to create records.
	current.benchmarking = false;
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
// whenever Automated field changes, set Aggregated field to match
	current.aggregated = current.automated;

})(current, previous);

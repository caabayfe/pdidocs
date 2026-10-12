(function executeRule(current, previous /*null when async*/) {
	new SNC.GlideTermTableAPI().calculateEstimate(current);
})(current, previous);

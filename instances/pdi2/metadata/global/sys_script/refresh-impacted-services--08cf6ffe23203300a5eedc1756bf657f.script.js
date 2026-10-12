(function executeRule(current, previous /*null when async*/) {
	new TaskUtils().triggerRefreshImpactedServices(current);
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	
	if (previous.license != current.license)
		SNC.UACTScriptUtils.updateSubscriptionAllocationCounts();
	
})(current, previous);

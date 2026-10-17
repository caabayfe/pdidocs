(function executeRule(current, previous /*null when async*/) {
	new ChangeRequestDiscovery().triggerBatchDiscovery(current.getUniqueValue(), false);
})(current, previous);

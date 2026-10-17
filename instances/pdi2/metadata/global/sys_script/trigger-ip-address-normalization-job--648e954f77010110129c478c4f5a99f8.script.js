(function executeRule(current, previous /*null when async*/) {
	if (typeof IPAddressDataFormatter != undefined && IPAddressDataFormatter.markColumnForNormalizationIfNeeded(current, previous))
		new SNC.BatchedJob().runJobIfNotRunning();
	
})(current, previous);

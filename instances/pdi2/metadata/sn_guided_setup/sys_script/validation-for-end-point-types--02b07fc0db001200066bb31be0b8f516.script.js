(function executeRule(current, previous /*null when async*/) {
	var ret = new GuidedSetupUtilSNC().validateConfigForEndPointTypes(current);
	if (!ret) {
		current.setAbortAction(true);
	}
})(current, previous);

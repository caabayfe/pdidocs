(function executeRule(current, previous /*null when async*/) {
	var utils = new GuidedSetupUtilSNC();
	if (!utils.validateRelationship(current)) {
		current.setAbortAction(true);
	}
})(current, previous);

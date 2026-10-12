(function executeRule(current, previous /*null when async*/) {

	var util = new GuidedSetupUtilSNC();
	if (!util.hasNoCyclicDependency(current)) {
		current.setAbortAction(true);
	}

})(current, previous);

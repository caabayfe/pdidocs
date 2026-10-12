(function executeRule(current, previous /*null when async*/) {

	if (!new GuidedSetupUtilSNC().isContentWeightValid(current)) {
		current.setAbortAction(true);
	}

})(current, previous);

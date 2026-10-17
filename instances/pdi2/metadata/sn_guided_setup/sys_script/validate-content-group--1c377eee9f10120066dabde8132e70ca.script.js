(function executeRule(current, previous /*null when async*/) {

	if (!(new GuidedSetupUtilSNC().validateContentGroup(current))) {
		current.setAbortAction(true);
	}

})(current, previous);

(function executeRule(current, previous /*null when async*/) {

	if (current.parent.changes()) {
		if (previous.parent) {
			new GuidedSetupUtilSNC().updateParentWeight(previous.parent);
		}
		if (current.parent) {
			new GuidedSetupUtilSNC().updateParentWeight(current.parent);
		}
	} else if (current.weight.changes()) {
		new GuidedSetupUtilSNC().updateParentWeight(current.parent);
	}

})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	if (!new SNC.GlideTermTableAPI().setStorageDetails(current)) {
		current.setAbortAction(true);
	}
})(current, previous);

(function executeRule(current, previous /* null when async */) {
	if (!gs.nil(current.num_workers) && current.num_workers <= 0) {
		gs.addErrorMessage(gs.getMessage('Number of workers must be at least 1.'));
		current.setAbortAction(true);
	}
}(current, previous));

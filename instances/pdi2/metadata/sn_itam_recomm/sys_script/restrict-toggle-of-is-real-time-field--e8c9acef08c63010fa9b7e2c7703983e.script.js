(function executeRule(current, previous) {
	if (current.getValue('results_deletion_in_progress') === '1' /* true */) {
		gs.addErrorMessage(gs.getMessage('A job is clearing out the calculated results as \'Is real time\' field was set to True. Please wait for the job to complete.'));
		current.setAbortAction(true);
	}
}(current, previous));

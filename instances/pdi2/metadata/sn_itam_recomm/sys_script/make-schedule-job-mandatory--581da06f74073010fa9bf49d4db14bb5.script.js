(function executeRule(current, previous) {
	gs.addErrorMessage(
		gs.getMessage('The following mandatory fields are not filled in: {0}', [current.job.getLabel()])
	);
	current.setAbortAction(true);
}(current, previous));

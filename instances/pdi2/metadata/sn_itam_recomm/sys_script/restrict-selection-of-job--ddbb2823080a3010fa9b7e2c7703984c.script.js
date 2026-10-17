(function executeRule(current, previous) {
	if (current.workspace.is_real_time.toString() === 'true' && !gs.nil(current.job)) {
		gs.addErrorMessage(
			gs.getMessage('Schedule job cannot be selected on the dashboard when \'Is real time\' field is True on the workspace')
		);
		current.setValue('job', '');
	} else if (current.workspace.is_real_time.toString() === 'false' && gs.nil(current.job)) {
		gs.addErrorMessage(
			gs.getMessage('The following mandatory fields are not filled in: {0}', [current.job.getLabel()])
		);
		current.setAbortAction(true);
	}
}(current, previous));

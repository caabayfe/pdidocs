function moveToWorkInProgress () {
	if (!g_form.hasField('state')) {
		getMessage('Cannot Start the Problem task as \'State\' is not visible', function(msg) {
			g_form.addErrorMessage(msg);
		});
		return false;
	}

	g_form.setValue('state', g_scratchpad.PRBTASK_STATES.WORK_IN_PROGRESS);
	g_form.save();
}

function onLoad() {
	function setScheduleJobOnLoad(workspace) {
		if (workspace && workspace.is_real_time === 'false' && workspace.job !== '') {
			g_form.setValue('job', workspace.job);
		}
	}

	if (g_form.isNewRecord()) {
		g_form.getReference('workspace', setScheduleJobOnLoad);
	}
}

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	function setJobOnWorkspaceChange(workspace) {
		if (workspace && workspace.is_real_time === 'false' && workspace.job !== '') {
			g_form.setValue('job', workspace.job);
		}
	}

	g_form.getReference('workspace', setJobOnWorkspaceChange);
}

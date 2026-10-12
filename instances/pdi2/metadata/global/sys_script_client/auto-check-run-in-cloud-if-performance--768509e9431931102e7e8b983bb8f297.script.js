function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	var isPerformanceTest = g_form.getValue('performance_test') == 'true';
	var runInCloudField = 'run_in_cloud';
	/*
	If the current test is a performance test and can run in cloud, auto check 'Run in cloud' option and disable it
	*/
	if (isPerformanceTest && !g_scratchpad.isClientRunnerEnabledForPerformance && g_scratchpad.isCloudRunnerPerfCompatible) {
		g_form.setValue(runInCloudField, true);
		g_form.setDisabled(runInCloudField, true);
	}

	// Enable 'Run in cloud' again if `Performance test` is unchecked and cloud runner is installed and configured
	if (!isPerformanceTest && !g_scratchpad.disableRunInCloud) {
		g_form.setDisabled(runInCloudField, false);
	}
}

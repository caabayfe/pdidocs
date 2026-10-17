(function executeRule(current, previous /*null when async*/) {

	var isCloudRunnerAvailable = sn_atf.PerformanceAPI.isCloudRunnerActive();
	var isPerformanceSchedule = !current.isNewRecord() && (current.performance_test == true); // Used to prevent disabling the field if the record is already marked as a performance test
	var isClientRunnerEnabledForPerformance = GlideProperties.getBoolean('sn_atf.performance.enable_browser_picker', false) && gs.hasRole('maint');
	var isCloudRunnerPerfCompatible = sn_atf.PerformanceAPI.isCloudRunnerActiveAndSupportsPerformance();
	g_scratchpad.disablePerformanceTestField = !isPerformanceSchedule && !isClientRunnerEnabledForPerformance && !(isCloudRunnerAvailable && isCloudRunnerPerfCompatible);
	g_scratchpad.disabledPerfFieldMessage = null;

	// Either Cloud Runner is not installed or username is not set
	if (!isCloudRunnerAvailable)
		g_scratchpad.disabledPerfFieldMessage = gs.getMessage('ATF:perf_requires_cloud_runner');

	// Cloud Runner is installed and username is set but installed version doesn't support performance
	if (isCloudRunnerAvailable && !isCloudRunnerPerfCompatible)
		g_scratchpad.disabledPerfFieldMessage = gs.getMessage('ATF:invalid_perf_cloud_runner_version', 'href="' + ATFUtil.getTestGeneratorAndCloudRunnerAppStorePageUrl() + '" style="display: contents;" target="_blank"');

	g_scratchpad.isPerformanceSchedule = isPerformanceSchedule;
	g_scratchpad.isCloudRunnerPerfCompatible = isCloudRunnerPerfCompatible;
	g_scratchpad.isClientRunnerEnabledForPerformance = isClientRunnerEnabledForPerformance;
	g_scratchpad.isRunInCloudChecked = !current.isNewRecord() && (current.run_in_cloud == true);
	g_scratchpad.isPerfPauseDisabled = !GlideProperties.getBoolean("sn_atf.performance.pause_enabled", true);

})(current, previous);

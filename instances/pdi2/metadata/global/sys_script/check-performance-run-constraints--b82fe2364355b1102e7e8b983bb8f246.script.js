(function executeRule(current, previous /*null when async*/) {
	var isClientRunnerEnabledForPerformance = GlideProperties.getBoolean('sn_atf.performance.enable_browser_picker', false) && gs.hasRole('maint');

	if (!isClientRunnerEnabledForPerformance) {
		var isPerformanceSupportedByCloudRunner = sn_atf.PerformanceAPI.isCloudRunnerActiveAndSupportsPerformance();
		var isRunInCloud = current.run_in_cloud == true;

		if (!isRunInCloud || !isPerformanceSupportedByCloudRunner) {
			current.setAbortAction(true);
			var isCloudRunnerActive = sn_atf.PerformanceAPI.isCloudRunnerActive();
			// If 'Run in cloud' is not checked or if cloud runner is not active, then display message notifying performance tests require cloud runner
			if (!isRunInCloud || !isCloudRunnerActive)
				gs.addErrorMessage(gs.getMessage('ATF:perf_requires_cloud_runner'));
			// if 'Run in cloud' is checked and Cloud Runner is active but installed version doesn't support performance, display upgrade store app message
			// Other error cases will be handled by the cloud runner validation business rules
			else if (isCloudRunnerActive && !isPerformanceSupportedByCloudRunner)
				gs.addErrorMessage(gs.getMessage('ATF:invalid_perf_cloud_runner_version', 'href="' + ATFUtil.getAppStoreBaseUrl() + '" style="display: contents;" target="_blank"'));

			current.performance_test = false;
		}
	}

})(current, previous);

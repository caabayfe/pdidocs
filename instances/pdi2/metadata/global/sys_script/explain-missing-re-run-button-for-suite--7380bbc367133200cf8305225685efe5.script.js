(function executeRule(current, previous /*null when async*/) {
	if (!sn_atf.ImpersonateAPI.canRunTestInSession())
		gs.addInfoMessage(gs.getMessage("Running tests and test suites is disabled while impersonating another user."));

	if (!sn_atf.AutomatedTestingFramework.isRunnerEnabled()) {
		var message;
		if (gs.getUser().hasRole('atf_test_admin') || gs.getUser().hasRole('admin'))
			message = gs.getMessage("enable_test_execution", new ATFVariablesUtil().getATFPropertiesURL());
		else
			message = gs.getMessage("Running tests and test suites is disabled. Only users with atf_test_admin or admin role can enable it");

		gs.addInfoMessage(message);
	}

	if (!sn_atf.AutomatedTestingFramework.isTestSuiteActive(current.test_suite))
		gs.addInfoMessage(gs.getMessage("This test suite cannot be re-run because it is inactive"), "ATFCurrentReRunSuiteDisabled");
})(current, previous);

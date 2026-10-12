(function executeRule(current, previous /*null when async*/) {
	if (!sn_atf.ImpersonateAPI.canRunTestInSession())
		gs.addInfoMessage(gs.getMessage("Unable to retrieve components. Running tests and test suites is disabled while impersonating another user."), "ATFDisabledWhileImpersonating");

	if (!sn_atf.AutomatedTestingFramework.isRunnerEnabled()) {
		var message;
		if (gs.getUser().hasRole('atf_test_admin') || gs.getUser().hasRole('admin'))
			message = gs.getMessage("enable_test_execution_retrieve", new ATFVariablesUtil().getATFPropertiesURL());
		else
			message = gs.getMessage("Unable to retrieve components. Running tests and test suites is disabled. Only users with atf_test_admin or admin role can enable it");

		gs.addInfoMessage(message, "ATFRunnerDisabled");
	}

	if (!current.test.active)
		gs.addInfoMessage(gs.getMessage("Unable to retrieve components. This test cannot be run because it is inactive"), "ATFCurrentTestDisabled");

	if (!current.active)
		gs.addInfoMessage(gs.getMessage("Unable to retrieve components. This step is inactive"), "ATFCurrentStepDisabled");

})(current, previous);

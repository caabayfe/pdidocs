(function executeRule(current, previous /*null when async*/) {
	if (!sn_atf.ImpersonateAPI.canRunTestInSession())
		gs.addInfoMessage(gs.getMessage("Running tests and test suites is disabled while impersonating another user."), "ATFDisabledWhileImpersonating");

	if (!sn_atf.AutomatedTestingFramework.isRunnerEnabled()) {
		var message;
		if (gs.getUser().hasRole('atf_test_admin') || gs.getUser().hasRole('admin'))
			message = gs.getMessage("enable_test_execution", new ATFVariablesUtil().getATFPropertiesURL());
		else
			message = gs.getMessage("Running tests and test suites is disabled. Only users with atf_test_admin or admin role can enable it");

		gs.addInfoMessage(message, "ATFRunnerDisabled");
	}

	if (!current.active)
		gs.addInfoMessage(gs.getMessage("This test cannot be run because it is inactive"), "ATFCurrentTestDisabled");

	if (new sn_atf.UserTestProcessor().hasTooManyModifiedRecords(current))
		gs.addInfoMessage(gs.getMessage("This test cannot be run because it has too many modified records. Use 'Reset Modified Records' to clear them."), "ATFTooManyModifiedRecords");

})(current, previous);

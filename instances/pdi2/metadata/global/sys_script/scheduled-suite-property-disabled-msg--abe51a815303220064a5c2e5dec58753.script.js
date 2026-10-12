(function executeRule(current, previous /*null when async*/) {
	if (!sn_atf.ImpersonateAPI.canRunTestInSession())
		gs.addInfoMessage(gs.getMessage("Running tests and test suites is disabled while impersonating another user."));

	if (!sn_atf.ATFSchedule.isScheduleEnabled()) {
		var message;
		if (gs.getUser().hasRole('atf_test_admin') || gs.getUser().hasRole('admin'))
			message = gs.getMessage("Scheduled suites are disabled. <a {0}>Enable scheduled suites here</a>", ["href=system_properties_ui.do?sysparm_title=Automated%20Testing%20Framework%20Properties&amp;sysparm_category=Test%20and%20Test%20Suite%20Properties,Test%20Debugging%20Properties,Screenshots%20Capture%20Mode,Test%20Runner%20Properties,Test%20Suite%20Report%20Properties,Email%20Properties"]);
		else
			message = gs.getMessage("Scheduled suites are disabled. Only users with atf_test_admin or admin role can enable it");

		gs.addInfoMessage(message);
	}

	if (!current.active)
		gs.addInfoMessage(gs.getMessage("This schedule will not run because it is inactive"));

})(current, previous);

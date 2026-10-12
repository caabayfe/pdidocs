function rerunFailedTests() {
	var testSuiteResultSysId;
	if (typeof rowSysId == 'undefined')
		testSuiteResultSysId = gel('sys_uniqueValue').value;
	else
		testSuiteResultSysId = rowSysId;
	
	var currentGR = new GlideRecord('sys_atf_test_suite_result');
	currentGR.get(testSuiteResultSysId);

	var dialog = new GlideModal("atf_pick_a_browser");
	dialog.setPreference("test_suite_sys_id", currentGR.test_suite);
	dialog.setPreference("previous_suite_result_sys_id", testSuiteResultSysId);
	dialog.setPreference('focusTrap', true);
	dialog.setWidth("600");
	dialog.setTitle(new GwtMessage().getMessage("Pick a Browser"));
	dialog.render();
}

function showProgress() {
	var sysId = ((typeof rowSysId == 'undefined') || rowSysId === null) ? g_form.getUniqueValue() : rowSysId;
	var currentGR = new GlideRecord('sys_atf_test_suite_result');
	if (!currentGR.get(sysId)) {
		g_form.addWarningMessage(new GwtMessage().getMessage("Unable to show progress. The suite result {0} does not exist", sysId));
		return;
	}
	var testSuiteSysId = currentGR.test_suite;
	if (!testSuiteSysId)
		g_form.addWarningMessage(new GwtMessage().getMessage("The suite result {0} cannot be re-run because the suite does not exist", sysId));
	ScriptLoader.getScripts('/scripts/PickABrowser/PickABrowserUtil.js', function() {
		var pabUtil = new PickABrowserUtil();
		pabUtil.viewTestSuiteProgress(testSuiteSysId, sysId);
	});
}

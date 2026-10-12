function pickABrowserPerformanceSuite(tableName, newStepFormTitle, stepQuery) {
	var testSuiteSysId = g_form.getUniqueValue();

	var dialog = new GlideModal("atf_pick_a_browser");
	dialog.setPreference("test_suite_sys_id", testSuiteSysId);
	dialog.setPreference("focusTrap", true);
	dialog.setWidth("600");
	dialog.setTitle(new GwtMessage().getMessage("Performance Suite"));
	dialog.setPreference("performance_run", true);
	dialog.render();
}

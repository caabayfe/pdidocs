function pickABrowserPerformance(tableName, newStepFormTitle, stepQuery) {
	var sysId = g_form.getUniqueValue();

	var dialog = new GlideModal("atf_pick_a_browser");
	dialog.setPreference("test_sys_id", sysId);
	dialog.setWidth("600");
	dialog.setTitle(new GwtMessage().getMessage("Performance Test"));
	dialog.setPreference("focusTrap", true);
	dialog.setPreference("table_name", tableName);
	dialog.setPreference("new_step_form_title", newStepFormTitle);
	dialog.setPreference("step_query", stepQuery);
	dialog.setPreference("performance_run", true);
	dialog.render();
}

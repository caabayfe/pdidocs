function pickABrowserDebug(tableName, newStepFormTitle, stepQuery) {
	var sysId = g_form.getUniqueValue();

	var dialog = new GlideModal("atf_pick_a_browser");
	dialog.setPreference("test_sys_id", sysId);
	dialog.setWidth("600");
	dialog.setTitle(new GwtMessage().getMessage("Debug Test"));
	dialog.setPreference("focusTrap", true);
	dialog.setPreference("table_name", tableName);
	dialog.setPreference("new_step_form_title", newStepFormTitle);
	dialog.setPreference("step_query", stepQuery);
	dialog.setPreference("is_pausing_enabled", true);
	dialog.setPreference("capture_node_logs", true);
	dialog.render();
}

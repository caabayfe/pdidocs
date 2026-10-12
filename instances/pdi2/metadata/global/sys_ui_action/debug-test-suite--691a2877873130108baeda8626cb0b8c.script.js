function pickABrowserDebug() {
	var testSuiteSysId = g_form.getUniqueValue();

	var dialog = new GlideModal("atf_pick_a_browser");
	dialog.setPreference("test_suite_sys_id", testSuiteSysId);
	dialog.setPreference("focusTrap", true);
	dialog.setWidth("600");
	dialog.setTitle(new GwtMessage().getMessage("Debug Test Suite"));
	dialog.setPreference("is_pausing_enabled", true);
	dialog.setPreference("capture_node_logs", true);
	dialog.render();
}

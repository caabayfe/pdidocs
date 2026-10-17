showTestSuitePicker();
function showTestSuitePicker() {
	var query = g_list.getQuery();
	var dialog = new GlideModal("sys_atf_add_to_suite");
	dialog.setPreference("test_query", query);
	dialog.setPreference("focusTrap", true);
	dialog.setTitle("Add to test suite");
	dialog.setWidth(400);
	dialog.render();
}

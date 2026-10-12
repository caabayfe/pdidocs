function addSelectedTestsToSuite() {
	var dialog = new GlideModal("sys_atf_add_to_suite");
	var list = g_list;
	dialog.setPreference("test_ids", g_list.getChecked());
	dialog.setTitle("Add to test suite");
	dialog.setWidth(400);
	dialog.setPreference("focusTrap", true);
	dialog.render();
	dialog.on("clearSelectedItems", function() {
		list.onAllChecked(false);
	});
}

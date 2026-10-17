function addMutuallyExclusiveTest() {
	// Only allow calling this from a test form
	if (typeof g_form === "undefined" || g_form.getTableName() !== "sys_atf_test")
		return;

	var dialog = new GlideModal("sys_atf_add_mutual_exclusion_rule");
	dialog.setPreference("test_ids", g_form.getUniqueValue());
	dialog.setPreference("is_from_test_form", "true");
	dialog.setTitle(new GwtMessage().getMessage("Add mutually exclusive test"));
	dialog.setWidth(400);
	dialog.setPreference("focusTrap", true);
	dialog.render();
}

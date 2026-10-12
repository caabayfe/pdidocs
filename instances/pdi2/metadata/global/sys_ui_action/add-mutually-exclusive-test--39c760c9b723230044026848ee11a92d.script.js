function addMutuallyExclusiveTest() {
	var dialog = new GlideModal("sys_atf_add_mutual_exclusion_rule");

	// Hold list in this closure so it can be accessed in the callback below
	// Support list v2 and v3
	var list = (typeof g_list !== "undefined" ? g_list : GlideList.get("sys_atf_test"));

	dialog.setPreference("test_ids", g_list.getChecked());
	dialog.setPreference("is_from_test_form", "false");
	dialog.setTitle(new GwtMessage().getMessage("Add mutually exclusive test"));
	dialog.setWidth(400);
	dialog.setPreference("focusTrap", true);
	dialog.render();
	dialog.on("clearSelectedItems", function() {
		if (list) {
			// Clear checked items, support list v2 and v3
			if (list.onAllChecked)
				list.onAllChecked(false);
			else if (list.clearChecked)
				list.clearChecked();
		}
	});
}

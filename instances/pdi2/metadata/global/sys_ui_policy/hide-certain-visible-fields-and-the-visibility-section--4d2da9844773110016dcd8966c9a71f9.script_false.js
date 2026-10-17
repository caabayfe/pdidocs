function onCondition() {
	var fieldName = "visible_summary";
	if (g_form.getControl(fieldName)) {
		var tabIndex = g_tabs2Sections.findTabIndex(fieldName);
		if (tabIndex > -1)
			g_tabs2Sections.showTab(tabIndex);
	}
}

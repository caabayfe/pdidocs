function onCondition() {
	var fieldName = "dependent";
	var useDependentValue = "use_dependent_field";
	if (g_form.getControl(fieldName) || g_form.getControl(useDependentValue)) {
		var tabIndex = g_tabs2Sections.findTabIndex(fieldName);
		if (tabIndex > -1)
			g_tabs2Sections.showTab(tabIndex);
	}
}

function onCondition() {
	if (g_scratchpad.sla_metadata.engine == "2010") {
		var fieldName = "reset_condition";
		if (g_form.getControl(fieldName)) {
			var tabIndex = g_tabs2Sections.findTabIndex(fieldName);
			if (tabIndex > -1)
				g_tabs2Sections.hideTab(tabIndex);
		}
	}
}

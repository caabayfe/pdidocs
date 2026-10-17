function onLoad() {
	// if visible, set client error details form section to active
	var tabIndex = g_tabs2Sections.findTabIndexByName("client_errordetails");
	if (tabIndex != -1 && g_tabs2Sections.isVisible(tabIndex)) {
		g_tabs2Sections.setActive(tabIndex);
		return;
	}

	// if visible, set failure details form section to active
	tabIndex = g_tabs2Sections.findTabIndexByName("failure_details");
	if (tabIndex != -1 && g_tabs2Sections.isVisible(tabIndex))
		g_tabs2Sections.setActive(tabIndex);
}

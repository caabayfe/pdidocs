function onCondition() {
	var linkAccountEnabled = g_form.getValue("link_account_enabled");
	if (linkAccountEnabled == 'true')
		g_form.setDisplay("automatic_link_enabled", true);
	
	var autoLinkEnabled = g_form.getValue("automatic_link_enabled");
	if (autoLinkEnabled == 'false')
		g_form.setDisplay("automatic_link_action", false);
}

function onCondition() {
	hideTabContainingField("channel_subscribe_roles");
	hideTabContainingField("user_subscribe_listener");
	hideTabContainingField("message_send_listener");
}

function hideTabContainingField(field) {
	if (g_form.getControl(field)) {
		var tabIndex = g_tabs2Sections.findTabIndex(field);
		if (tabIndex > -1)
			g_tabs2Sections.hideTab(tabIndex);
	}
}

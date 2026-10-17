function onCondition() {
	showTabContainingField("channel_subscribe_roles");
	showTabContainingField("user_subscribe_listener");
	showTabContainingField("message_send_listener");
}

function showTabContainingField(field) {
	if (g_form.getControl(field)) {
		var tabIndex = g_tabs2Sections.findTabIndex(field);
		if (tabIndex > -1)
			g_tabs2Sections.showTab(tabIndex);
	}
}

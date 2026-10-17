function editInUIBuilder() {
	var page = g_scratchpad.activity_ui_page;
	if (!page) {
		g_form.addInfoMessage(getMessage('Error loading page in UI Builder. Please contact support.'));
		return;
	}
	var variant = g_scratchpad.activity_ui_screen;
	if (!variant) {
		g_form.addInfoMessage(getMessage('Activity UI is missing a corresponding screen in UI Builder. Please contact support.'));
		return;
	}
	g_navigation.open('/now/builder/ui/edit/experience/ac22dd54c35a201098c960bc0eba8fed/' + page + '/' + variant, '_blank');
}

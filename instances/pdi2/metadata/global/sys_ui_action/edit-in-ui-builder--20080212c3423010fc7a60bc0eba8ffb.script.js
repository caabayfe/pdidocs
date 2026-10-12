function editInUIBuilder() {
	var activity_ui = g_scratchpad.activity_ui;
	var page = g_scratchpad.activity_ui_page;
	var variant = g_scratchpad.activity_ui_screen;
	
	if (!activity_ui) {
		g_form.addInfoMessage(getMessage('Activity UI field value is not properly set. Please contact support.'));
		return;
	}
	
	if (!page) {
		g_form.addInfoMessage(getMessage('Error loading page in UI Builder. Please contact support.'));
		return;
	}
	
	if (!variant) {
		g_form.addInfoMessage(getMessage('Activity UI is missing a corresponding screen in UI Builder. Please contact support.'));
		return;
	}
	
	g_navigation.open('/now/builder/ui/edit/experience/ac22dd54c35a201098c960bc0eba8fed/' + page + '/' + variant, '_blank');
}

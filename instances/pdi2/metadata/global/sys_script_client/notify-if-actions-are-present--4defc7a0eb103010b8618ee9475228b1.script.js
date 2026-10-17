function onLoad() {
	if(g_scratchpad.actionsPresentInNotification) {
		g_form.addInfoMessage(getMessage('This notification includes one or more actions. Ensure the actions are associated with content by going to "Link Actions to Content" tab.'));
	}
}

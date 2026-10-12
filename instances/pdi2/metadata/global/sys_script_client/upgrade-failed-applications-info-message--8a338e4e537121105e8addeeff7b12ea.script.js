function onLoad() {
	if (g_form.getValue("disposition") != 'failed')
		return;
		
	var upgradeHistoryLink = '<a href="/sys_upgrade_history.do?sys_id=' + g_form.getValue("upgrade_history") + '" target="_blank">';
	g_form.addInfoMessage(new GwtMessage().getMessage("To know the reason for the application upgrade failure, please review the logs attached to the {0}upgrade history{1}.", upgradeHistoryLink, '</a>'));
}

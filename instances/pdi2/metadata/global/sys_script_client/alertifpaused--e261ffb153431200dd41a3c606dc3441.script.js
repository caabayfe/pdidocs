function onLoad() {
    if (g_form.getValue('status') == 'Paused')
		g_form.addInfoMessage(getMessage('MID Server Paused Description'));
}

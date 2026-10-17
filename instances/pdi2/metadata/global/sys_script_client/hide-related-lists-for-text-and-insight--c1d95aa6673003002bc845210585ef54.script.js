function onLoad() {
	if (g_form.getValue('type') == 'text' || g_form.getValue('type') == 'insight')
		g_form.hideRelatedLists();

}

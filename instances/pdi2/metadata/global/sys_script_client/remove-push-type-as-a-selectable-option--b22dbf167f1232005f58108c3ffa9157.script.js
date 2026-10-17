function onLoad() {
	if (g_form.getValue('type') != 'Push') {
		g_form.removeOption('type', 'Push');
	}
}

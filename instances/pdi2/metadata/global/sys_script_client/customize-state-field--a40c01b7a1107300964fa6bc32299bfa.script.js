function onLoad() {
	var taskInState = g_form.getValue('state');
	if (taskInState === '3' || taskInState === '7') {
		g_form.setDisabled('transferred_for', true);
		g_form.setDisabled('active', true);
	}
}

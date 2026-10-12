function onLoad() {
	if (g_form.isNewRecord())
		g_form.setValue("fail_on_server_error", true);
}

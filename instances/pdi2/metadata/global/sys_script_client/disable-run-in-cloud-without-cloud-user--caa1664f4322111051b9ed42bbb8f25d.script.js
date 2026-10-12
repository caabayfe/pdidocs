function onLoad() {
	if (g_scratchpad.disableRunInCloud === "true") {
		g_form.setValue('run_in_cloud', false);
		g_form.setDisabled('run_in_cloud', true);
	} else if (g_form.isNewRecord())
		g_form.setValue('run_in_cloud', true);
}

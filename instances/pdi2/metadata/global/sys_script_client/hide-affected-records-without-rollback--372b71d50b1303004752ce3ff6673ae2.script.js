function onLoad() {
	if (g_form.getValue('rollback_context') == '') {
		g_form.setSectionDisplay("affected_recordsummary", false);
	}
}

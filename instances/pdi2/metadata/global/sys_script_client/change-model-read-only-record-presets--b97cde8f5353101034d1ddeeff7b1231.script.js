function onLoad() {
	if (!g_scratchpad.change_model || g_form.isNewRecord())
		return;
	
	g_scratchpad.change_model.refreshReadOnlyFields(true);
}

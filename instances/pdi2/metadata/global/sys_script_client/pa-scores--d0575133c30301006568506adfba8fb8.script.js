function onLoad() {
   // When editing an existing score, only the "Value" can be modified, all the other fields should be read-only
	if (g_form.isNewRecord())
		return;
	
	g_form.setReadOnly("indicator", true);
	g_form.setReadOnly("breakdown", true);
	g_form.setReadOnly("element", true);
	g_form.setReadOnly("breakdown_level2", true);
	g_form.setReadOnly("element_level2", true);
	g_form.setReadOnly("start_at", true);
}

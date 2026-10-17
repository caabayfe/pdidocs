function onLoad() {
   // When editing an existing score_l2, only the "Value" can be modified, all the other fields should be read-only
	if (g_form.isNewRecord())
		return;
	
	g_form.setReadOnly("id", true);
	g_form.setReadOnly("ref_id", true);
	g_form.setReadOnly("breakdown_level2", true);
	g_form.setReadOnly("element_level2", true);
}

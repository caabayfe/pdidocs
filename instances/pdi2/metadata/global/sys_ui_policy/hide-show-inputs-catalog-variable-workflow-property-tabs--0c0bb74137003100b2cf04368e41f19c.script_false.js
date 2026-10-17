function onCondition() {
	if (!g_form.isNewRecord())
		g_form.setSectionDisplay("inputs", true);
	g_form.setSectionDisplay("catalog_variables", false);
}

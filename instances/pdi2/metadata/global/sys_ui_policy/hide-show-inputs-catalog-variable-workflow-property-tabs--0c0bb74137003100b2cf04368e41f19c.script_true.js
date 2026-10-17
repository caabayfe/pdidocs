function onCondition() {
	g_form.setSectionDisplay("inputs", false);
	if (!g_form.isNewRecord())
		g_form.setSectionDisplay("catalog_variables", true);
}

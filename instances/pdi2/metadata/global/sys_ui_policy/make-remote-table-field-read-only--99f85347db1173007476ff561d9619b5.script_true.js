function onCondition() {
	if (!g_form.isNewRecord())
		g_form.setReadOnly("scriptable_table", true);
}

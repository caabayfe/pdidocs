function onCondition() {
	if (g_form.isNewRecord())
		g_form.setReadOnly("active", true);
}

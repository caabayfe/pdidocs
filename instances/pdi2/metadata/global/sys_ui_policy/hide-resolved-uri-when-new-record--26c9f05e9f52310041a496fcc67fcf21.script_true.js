function onCondition() {
	if (g_form.isNewRecord()) {
		g_form.setDisplay('operation_uri', false);
	}
}

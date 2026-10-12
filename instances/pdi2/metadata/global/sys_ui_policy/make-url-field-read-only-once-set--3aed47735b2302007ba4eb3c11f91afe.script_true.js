function onCondition() {
	if (!g_form.isNewRecord()) {
		g_form.setReadOnly('url', true);
	}
}

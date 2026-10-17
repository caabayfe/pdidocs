function onCondition() {
	if (g_form.isNewRecord()) {
		g_form.setSectionDisplay('security', true);
		g_form.setSectionDisplay('documentation', false);
		g_form.setSectionDisplay('content_negotiation', false);
	}
}

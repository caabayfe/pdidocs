function onLoad() {
	g_form.setMandatory('source_table', true);
	if (g_form.getValue('manual_selection') === 'true') {
		g_form.setMandatory('source_table', false);
		g_form.setVisible('source_table', true);
	} else if (g_form.getValue('default_group') === 'true') {
		g_form.setMandatory('source_table', false);
		g_form.setVisible('source_table', false);
	}
}

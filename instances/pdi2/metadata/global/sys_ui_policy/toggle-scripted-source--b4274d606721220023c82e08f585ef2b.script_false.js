function onCondition() {
	g_form.setVisible('condition', true);
	g_form.setDisplay('source_table', true);
	g_form.setMandatory('source_table', true);
	g_form.setDisplay('primary_display_field', true);
	g_form.setDisplay('display_fields', true);

	g_form.setDisplay('data_fetch_script', false);
	g_form.setDisplay('facet_generation_script', false);
}

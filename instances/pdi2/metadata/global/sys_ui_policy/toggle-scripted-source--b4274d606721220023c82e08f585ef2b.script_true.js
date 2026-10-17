function onCondition() {
	g_form.setVisible('condition', false);
	g_form.setMandatory('source_table', false);
	g_form.setDisplay('source_table', false);
	g_form.setDisplay('primary_display_field', false);
	g_form.setDisplay('display_fields', false);

	g_form.setDisplay('data_fetch_script', true);
	g_form.setDisplay('facet_generation_script', true);
}

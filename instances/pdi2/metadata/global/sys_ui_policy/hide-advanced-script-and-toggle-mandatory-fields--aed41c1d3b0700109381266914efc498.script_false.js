function onCondition() {
	g_form.setMandatory('source_mapping_field', false);
	g_form.setMandatory('context_mapping_field', false);
	g_form.setMandatory('advanced_mapping_script', true);
	g_form.setDisplay('source_mapping_field', false);
	g_form.setDisplay('context_mapping_field', false);
	g_form.setDisplay('advanced_mapping_script', true);
}

function onCondition() {
	if (g_form.getValue('can_iterate')) {
		g_form.setSectionDisplay('source_table', true); 
		g_form.setSectionDisplay('source_filter', true);
	} else {
		g_form.setSectionDisplay('source_table', false); 
		g_form.setSectionDisplay('source_filter', false);
	}
}

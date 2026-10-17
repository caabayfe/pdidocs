function onCondition() {
	if (g_form.getBooleanValue("enable_typeahead")) {
		g_form.setDisplay('typeahead_glyph', true);	
		g_form.setDisplay('page', true);
		g_form.setDisplay('typeahead_template', false);
	}
}

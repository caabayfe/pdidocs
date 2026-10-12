function onCondition() {
	if (g_form.getBooleanValue("enable_typeahead")) {
		g_form.setDisplay('typeahead_glyph', false);	
		g_form.setDisplay('page', false);
		g_form.setDisplay('typeahead_template', true);
	}
}

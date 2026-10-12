function onCondition() {
	g_form.setDisplay('advanced_typeahead_config', true);
	
	var advancedIsEnabled = g_form.getBooleanValue('advanced_typeahead_config');
	if (advancedIsEnabled) {
		g_form.setDisplay('typeahead_glyph', false);	
		g_form.setDisplay('page', false);
		g_form.setDisplay('typeahead_template', true);
	} else {
		g_form.setDisplay('typeahead_glyph', true);	
		g_form.setDisplay('page', true);
		g_form.setDisplay('typeahead_template', false);
	}
}

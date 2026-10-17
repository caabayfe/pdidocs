function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var hasChoices = g_scratchpad.has_source_field_choices;
	
	// only hide if scratchpad value is false, ignore if scratchpad value is null
	if (hasChoices != null && !hasChoices) 
		g_form.setDisplay('source_field', false);
}

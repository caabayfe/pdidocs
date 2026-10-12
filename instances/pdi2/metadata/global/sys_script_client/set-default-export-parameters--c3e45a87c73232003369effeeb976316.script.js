function onChange(control, oldValue, newValue, isLoading, isTemplate) {	
	// When loading don't modify the user set export parameters.
	if (isLoading && !g_form.isNewRecord()) {
		return;
	}

	var fileFormat = newValue.toLowerCase();
	
	if (g_scratchpad.exportDisplayDefaults[fileFormat]) {
		g_form.setValue('use_display_value', g_scratchpad.exportDisplayDefaults[fileFormat].display_value.toString());
		g_form.setValue('use_label', g_scratchpad.exportDisplayDefaults[fileFormat].display_label.toString());
	}
}

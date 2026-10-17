function onChange(control, oldValue, newValue, isLoading, isTemplate) {	
	if (newValue == "true") {
		g_form.showFieldMsg("use_custom_field_for_attach", getMessage("It is recommended that you add the attach note to a journal field. Empty means do not add the attach note to any field."), "info");
		g_form.setDisplay("attach_note_field", true);
	} else {
		g_form.hideFieldMsg("use_custom_field_for_attach", true);
		g_form.setDisplay("attach_note_field", false);
	}
}

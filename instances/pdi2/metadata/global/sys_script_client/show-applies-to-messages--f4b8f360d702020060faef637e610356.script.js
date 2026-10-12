function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (!newValue)
        g_form.showFieldMsg("applies_to", getMessage("No conflicts will be processed if None is selected"), "info");
	
}

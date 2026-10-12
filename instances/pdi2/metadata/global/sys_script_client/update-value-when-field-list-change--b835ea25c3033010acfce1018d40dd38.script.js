function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
	g_form.setValue("field_value", "");
	g_form.setValue("field_display_value", "");
}

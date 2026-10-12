function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    g_form.setValue("source_field", "");
    g_form.setValue("target_field", "");
}

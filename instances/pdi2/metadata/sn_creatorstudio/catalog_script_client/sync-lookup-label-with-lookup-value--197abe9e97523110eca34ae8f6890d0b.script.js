function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading) {
        return;
    }
    g_form.setValue('lookup_label', newValue);
}

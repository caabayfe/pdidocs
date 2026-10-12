function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading) {
        return;
    }
    if (oldValue && oldValue !== newValue) {
        g_form.clearValue('error_category');
    }
}

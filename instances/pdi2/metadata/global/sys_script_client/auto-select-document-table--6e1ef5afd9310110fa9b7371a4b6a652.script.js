function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue != oldValue) {
        g_form.clearValue('type_document');
    }
}

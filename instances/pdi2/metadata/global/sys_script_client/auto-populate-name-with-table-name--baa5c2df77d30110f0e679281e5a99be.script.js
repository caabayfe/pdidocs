function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (g_form.getValue('name') === '') {
        g_form.setValue('name', newValue);
    }
}

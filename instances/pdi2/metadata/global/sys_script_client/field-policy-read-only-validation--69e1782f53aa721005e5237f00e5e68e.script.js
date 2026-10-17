function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue == 'true' && g_form.getBooleanValue('mandatory')) {
        g_form.setValue('mandatory', false);
        g_form.showFieldMsg('mandatory', getMessage('Mandatory disabled because Read-only is enabled'), 'info');
    }
}

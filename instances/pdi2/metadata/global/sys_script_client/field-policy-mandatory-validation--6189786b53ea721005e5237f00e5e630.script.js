function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue == 'true' && g_form.getBooleanValue('read_only')) {
        g_form.setValue('read_only', false);
        g_form.showFieldMsg('read_only', getMessage('Read-only disabled because Mandatory is enabled'), 'info');
    }

}

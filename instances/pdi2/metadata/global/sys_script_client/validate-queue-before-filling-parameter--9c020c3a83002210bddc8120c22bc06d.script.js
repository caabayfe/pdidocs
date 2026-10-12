function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    if (g_form.getValue('queue') === '') {
        g_form.clearValue('parameter');
        g_form.addInfoMessage(getMessage('Please select a queue'));
    }
}

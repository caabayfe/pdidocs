function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue && newValue.includes('-')) {
        getMessage('Please enter a positive duration value', function(translatedMsg) {
            g_form.showFieldMsg('due_in', translatedMsg, 'error');
        });
        return;
    }
}

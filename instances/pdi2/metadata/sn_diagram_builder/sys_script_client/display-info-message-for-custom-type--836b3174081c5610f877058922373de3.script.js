function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue === 'internal') {
        g_form.showFieldMsg('value_type', getMessage('Custom type name should prefix with underscore'), 'info');
    } else {
        g_form.hideFieldMsg('value_type');
    }
}

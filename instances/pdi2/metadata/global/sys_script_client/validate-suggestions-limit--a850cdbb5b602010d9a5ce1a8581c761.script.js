function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    if (newValue < 0) {
        g_form.showFieldMsg('limit', getMessage('Limit must be set to a non-negative number'), 'error');
    } else if (oldValue < 0 && newValue >= 0) {
        g_form.hideFieldMsg('limit');
    }
}

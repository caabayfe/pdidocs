function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    g_form.showFieldMsg('action', getMessage('Save this recommendation to check for action inputs.'));
}

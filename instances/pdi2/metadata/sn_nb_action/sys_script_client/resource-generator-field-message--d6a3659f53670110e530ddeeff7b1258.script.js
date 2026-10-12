function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    g_form.showFieldMsg('resource_generator', getMessage('Save this recommendation to use this generator.'));
}

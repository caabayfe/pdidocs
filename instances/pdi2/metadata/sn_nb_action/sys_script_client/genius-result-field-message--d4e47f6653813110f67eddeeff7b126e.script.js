function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    g_form.showFieldMsg('genius_result_configuration', getMessage('Save this record to use the dynamic values from the selected configuration.'));
}

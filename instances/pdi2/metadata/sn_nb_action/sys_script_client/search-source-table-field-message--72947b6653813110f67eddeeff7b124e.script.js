function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    g_form.showFieldMsg('search_source_table', getMessage('Save this record to use the dynamic values from the selected source.'));
}

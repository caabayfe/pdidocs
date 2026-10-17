function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var type = g_form.getValue('entity_type');
    g_form.setValue('entity_table', type);
}

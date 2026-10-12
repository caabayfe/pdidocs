function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var table = g_form.getValue('source_type') == 'TABLE';
    var archived = g_form.getValue('source_type') == 'ARCHIVED_DATA';
    var ar_table = newValue.indexOf("ar_") > -1;

    if (table && ar_table) {
        g_form.setValue('source_type', 'ARCHIVED_DATA');
    }

    if (archived && !ar_table) {
        g_form.addErrorMessage(getMessage("Please select an Archived Table"));
    }
}

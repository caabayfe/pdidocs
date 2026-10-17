function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue != "" && g_form.isNewRecord())
        g_form.getReference('external_dataset', updateTableFromDataSet);
}

function updateTableFromDataSet(dataSource) {
    g_form.setValue("table", dataSource.case_table);
}

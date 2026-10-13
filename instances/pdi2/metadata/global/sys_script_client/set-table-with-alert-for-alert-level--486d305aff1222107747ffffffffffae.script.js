function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }

    // If alert is removed, table field should be too 
    if (newValue === '') {
        g_form.setValue('table', '');
    }

    // If alert is populated, populate the table field with table from alert
    // Otherwise if alert is empty, table should be empty
    var alert = g_form.getReference('alert');
    if (alert === '') {
        g_form.setValue('table', '');
    } else {
		g_form.setValue('table', alert.table);
    }
    return;
}

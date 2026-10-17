function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    if (newValue === '') {
        g_form.setDisplay('table', false);
        g_form.setValue('type', '');
    } else {
        var entity = g_form.getReference('entity');
        if (entity) {
            g_form.setValue('table', entity.table);
            g_form.setDisplay('table', true);
            g_form.setValue('type', '');
        }
    }
}

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    g_form.getReference('cube', function(c) {
        g_form.setValue('facts_table', c.facts_table);
    });

}

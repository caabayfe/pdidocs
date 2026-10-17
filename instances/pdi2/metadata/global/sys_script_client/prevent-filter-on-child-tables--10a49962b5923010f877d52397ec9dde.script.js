function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    if (g_form.getDisplayBox('attribute').value == "filter") {
        g_form.clearOptions('source');
        var datasource = g_form.getReference('datasource');
        g_form.addOption('source', datasource.source, datasource.source);
    }
}

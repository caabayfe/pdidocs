function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading) {
        return;
    }
    if (!newValue) {
        return;
    }
    g_form.getReference('error_category', function(categoryGr) {
        var catSourceApp = categoryGr.getValue('source_application');
        if (catSourceApp) {
            g_form.setValue('source_application', catSourceApp);
        }
    });
}

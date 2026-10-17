function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    getMessage('{0} -> {1}', function(msg) {
        var newName = new GwtMessage().format(msg, g_form.getValue('language_code'), newValue);
        g_form.setValue('name', newName);
    });
}

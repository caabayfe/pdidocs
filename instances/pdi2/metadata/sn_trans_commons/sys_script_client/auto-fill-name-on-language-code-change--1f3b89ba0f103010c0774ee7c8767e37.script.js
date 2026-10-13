function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    getMessage('{0} -> {1}', function(msg) {
        var newName = new GwtMessage().format(msg, newValue, g_form.getValue('mapped_language_code'));
        g_form.setValue('name', newName);
    });
}

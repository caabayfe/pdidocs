function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (oldValue != '' && newValue != oldValue) {
        var message = getMessage('Changing the Search application configuration will lead to an update in the Search result mapping list.');
        var type = "warning";
        g_form.addFormMessage(message, type);
    }
}

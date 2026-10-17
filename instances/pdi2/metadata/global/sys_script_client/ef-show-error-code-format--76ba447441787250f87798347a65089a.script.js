function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '')
        return;

    // Clear any previous messages on error_code
    g_form.hideFieldMsg('error_code', true);

    // Fetch the referenced record
    g_form.getReference('source_application', function(ref) {
        var gwt = new GwtMessage();
        var message;
        
        if (ref && ref.error_prefix) {
            var prefix = ref.error_prefix;
            message = gwt.getMessage('Error code must follow the format: {0}-XXXX (e.g., {0}-1234)', prefix);
            g_form.showFieldMsg('error_code', message, 'info');
        } else {
            message = gwt.getMessage('Error code must follow the format: PREFIX-XXXX (e.g., APP-1234)');
            g_form.showFieldMsg('error_code', message, 'info');
        }
    });
}

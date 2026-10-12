function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue === '') {
        return;
    }

    var ignoreCache = g_form.getBooleanValue('ignore_cache');

    if (!ignoreCache) {
        var mainMsg = getMessage("Ignore cache in sys property");
        var linkText = getMessage("Read More");
        var msg = formatMessage(mainMsg, linkText);

        g_form.addWarningMessage(msg);
    }

}

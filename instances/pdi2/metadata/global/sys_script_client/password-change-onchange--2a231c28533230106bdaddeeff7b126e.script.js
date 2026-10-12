function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
        return;
    }
    var isPasswordExpirationFeatureEnabled = g_scratchpad.isPasswordExpirationFeatureEnabled;

    var sections = g_form.getSections();
    var reset = g_form.getValue('reset');

    if ((newValue == 'true') && isPasswordExpirationFeatureEnabled) {
        sections[4].style.display = 'block'; // expiration tab
    } else if (reset != "true") {
        sections[4].style.display = 'none'; // expiration tab
        g_form.setValue("send_expiration_reminder", false);
    }
}

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
        return;
    }
    var isPasswordExpirationFeatureEnabled = g_scratchpad.isPasswordExpirationFeatureEnabled;

    var sections = g_form.getSections();
    var change = g_form.getValue('change');
    var publicAccess = g_form.getValue('public_access');

    if (newValue == 'true' && isPasswordExpirationFeatureEnabled === 'true') {
        sections[4].style.display = 'block'; // expiration
    } else if (change != 'true') {
        sections[4].style.display = 'none'; // expiration
        g_form.setValue("send_expiration_reminder", false);
    }
}

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
        return;
    }
    var isPasswordExpirationFeatureEnabled = g_scratchpad.isPasswordExpirationFeatureEnabled;
    var sections = g_form.getSections();
    var change = g_form.getValue('change');
    var unlockAccount = g_form.getValue('unlock_account');
    if (newValue == 'true') {
        sections[1].style.display = 'block'; // details
        sections[2].style.display = 'block'; // advanced
        sections[3].style.display = 'block'; // enrollment
        if (isPasswordExpirationFeatureEnabled)
            sections[4].style.display = 'block'; // expiration
        g_form.showRelatedList("pwd_map_proc_to_verification");
    } else {
        if (unlockAccount != 'true') {
            g_form.setValue('public_access', false); // Disable public access option
            sections[1].style.display = 'none'; // details
            sections[2].style.display = 'none'; // advanced
            sections[3].style.display = 'none'; // enrollment
            g_form.hideRelatedList("pwd_map_proc_to_verification");
        }
        if (change != 'true') {
            sections[4].style.display = 'none'; // expiration
            g_form.setValue("send_expiration_reminder", false);
        }
    }

}

function onLoad() {
    // isNewRecord is set by Business Rule
    if (g_scratchpad["isNewRecord"]) {
        // Hide Active field for new records:
        g_form.setVisible('active', false);
    }
    // Hide password reset only related fields, if reset is not selected
    var sections = g_form.getSections();
    var reset = g_form.getValue('reset');
    var change = g_form.getValue('change');
    var unlockAccount = g_form.getValue('unlock_account');
    var publicAccess = g_form.getValue('public_access');
    if (reset == 'true' || unlockAccount == 'true') {
        sections[1].style.display = 'block'; // details
        sections[2].style.display = 'block'; // advanced
        sections[3].style.display = 'block'; // enrollment
        sections[4].style.display = (publicAccess == 'true' || change == 'true') ? 'block' : 'none'; // expiration

        g_form.showRelatedList("pwd_map_proc_to_verification");
    } else {
        sections[1].style.display = 'none'; // details
        sections[2].style.display = 'none'; // advanced
        sections[3].style.display = 'none'; // enrollment
        if (change != 'true')
            sections[4].style.display = 'none'; // expiration

        g_form.hideRelatedList("pwd_map_proc_to_verification");
    }

    var isPasswordExpirationSubflowMapped = g_scratchpad.isPasswordExpirationSubflowMapped;

    if (isPasswordExpirationSubflowMapped) {
        g_form.setReadOnly("send_expiration_reminder", false);
    } else {
        g_form.setReadOnly("send_expiration_reminder", true);
        g_form.setValue("send_expiration_reminder", false); 
    }
}

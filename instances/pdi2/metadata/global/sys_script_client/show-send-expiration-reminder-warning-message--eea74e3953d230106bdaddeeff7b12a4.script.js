function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '' || newValue === 'true') {
        return;
    }

    if (g_scratchpad.isPasswordExpirationSubflowMapped) {
        getMessage('Disabling this checkbox will result in disabling sending the password expiration reminder notifications, and also syncing the `Password Expiration` table data for this process.', function(msg) {
            g_form.showFieldMsg('send_expiration_reminder', msg, 'warning');
        });
    } else {
        getMessage('To enable password expiration, please map the appropriate `Password expiration details flow` property in the corresponding credential store type record.', function(msg) {
            g_form.showFieldMsg('send_expiration_reminder', msg, 'info');
        });
    }
}

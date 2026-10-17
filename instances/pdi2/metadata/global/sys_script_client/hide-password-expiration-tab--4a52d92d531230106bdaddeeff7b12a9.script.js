function onLoad() {
    var isPasswordExpirationFeatureEnabled = g_scratchpad.isPasswordExpirationFeatureEnabled;
	var isPasswordExpirationSubflowMapped = g_scratchpad.isPasswordExpirationSubflowMapped;
    if (isPasswordExpirationFeatureEnabled === 'false') {
        g_form.setSectionDisplay('password_expirationconfiguration', false);
    } else if (!g_form.getBooleanValue("send_expiration_reminder") && !isPasswordExpirationSubflowMapped) {
        getMessage("To enable password expiration, please map the appropriate `Password expiration details flow` property in the corresponding credential store type record.", function(msg) {
            g_form.showFieldMsg('send_expiration_reminder', msg, 'info');
        });
    }
}

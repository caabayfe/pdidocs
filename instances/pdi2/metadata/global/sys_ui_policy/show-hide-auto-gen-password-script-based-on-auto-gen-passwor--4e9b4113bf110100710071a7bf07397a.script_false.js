function onCondition() {
    var ACCEPTS_PASSWORD = '0';
    g_form.setValue("email_password_reset_url", false);
    var credentialStore = g_form.getReference("cred_store");
    var grType = new GlideRecord("pwd_cred_store_type");
    grType.get(credentialStore.type);
    var useFlowEnabled = grType.getValue('use_flow') == 'true';
	var acceptsPassword = grType.getValue('password_delivery_mechanism') == ACCEPTS_PASSWORD;
    if (useFlowEnabled) {
        var isResetFlowMapped = grType.getValue('passd_reset_flow') != '';
        var supportsForcePassword = grType.supports_force_password_change == 'true';
        g_form.setDisplay("password_needs_reset", isResetFlowMapped && supportsForcePassword);
        g_form.setDisplay("display_password", acceptsPassword);
        g_form.setDisplay("send_email", acceptsPassword);
    } else {
        g_form.setDisplay("password_needs_reset", true);
        g_form.setDisplay("display_password", true);
        g_form.setDisplay("send_email", true);
    }
}

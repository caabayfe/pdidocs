function onCondition() {
    if (g_form.getBooleanValue(("secure_connection"))) {
        g_form.setVisible("keystore_password", true);
        g_form.setMandatory("keystore_password", true);
        g_form.setVisible("keystore_private_key_password", true);
    }
}

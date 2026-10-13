function onCondition() {
    g_form.setDisplay("use_unified_keystore", false);
    g_form.setDisplay("keystore_certificate_alias", false);
    if (!g_form.getBooleanValue("use_unified_keystore")) {
        g_form.setVisible("keystore_private_key_password", false);
        g_form.setMandatory("keystore_password", false);
        g_form.setVisible("keystore_password", false);
    }
}

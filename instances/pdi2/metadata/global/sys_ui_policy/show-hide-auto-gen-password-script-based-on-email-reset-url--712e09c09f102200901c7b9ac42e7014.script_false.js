function onCondition() {
    var acceptsPassword = false;
    var credentialStore = g_form.getReference("cred_store");
    var grType = new GlideRecord("pwd_cred_store_type");
    if (grType.get(credentialStore.type)) {
        var useFlowEnabled = grType.getValue('use_flow') == 'true';
        acceptsPassword = !useFlowEnabled || grType.getValue('password_delivery_mechanism') == '' || grType.getValue('password_delivery_mechanism') == '0';
    }
    if (acceptsPassword)
        g_form.setDisplay('auto_gen_password', true);
    else {
        g_form.setValue("display_password", false);
        g_form.setValue("send_email", false);
        g_form.setValue("auto_gen_password", false);
        g_form.setDisplay('auto_gen_password', false);
    }
}

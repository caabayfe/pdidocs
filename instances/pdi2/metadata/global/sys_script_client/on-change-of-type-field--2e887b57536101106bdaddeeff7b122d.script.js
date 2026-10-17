function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    g_form.clearMessages();
    var gr = new GlideRecord("pwd_cred_store_type");
    gr.get(newValue);

    var acceptsPassword = gr.getValue('password_delivery_mechanism') == '' || gr.getValue('password_delivery_mechanism') == '0';
    var isResetFlowEmpty = gr.passd_reset_flow == '';
    var isChangeFlowEmpty = gr.pwd_change_flow == '';
    var credStoreTypeName = gr.name.escapeHTML();
    var isFlowEnabled = gr.use_flow == 'true';

    if (isFlowEnabled && isChangeFlowEmpty && (!acceptsPassword || isResetFlowEmpty)) {
        g_form.setDisplay('auto_gen_password_script', false);
        g_form.setDisplay('enable_password_policy', false);
        g_form.setDisplay('enable_password_strength', false);
        g_form.setDisplay('enforce_history_policy', false);
        g_form.setMandatory('password_policy', false);
        g_form.setDisplay('password_policy', false);
        g_form.setDisplay('pwd_rule', false);
        g_form.setDisplay('pwd_rule_hint', false);
        g_form.setDisplay('strength_rule', false);
        var msg = formatMessage(getMessage("All the fields related to password generation and password policy are hidden because the '{0}' doesn't accept a password as input."), credStoreTypeName);
        g_form.addInfoMessage(msg);
    } else {
        g_form.setDisplay('enable_password_policy', true);
        g_form.setDisplay('enable_password_strength', true);
        g_form.setDisplay('auto_gen_password_script', true);
        g_form.setDisplay('password_policy', true);
        if (gr.supports_history_check == 'true')
            g_form.setDisplay('enforce_history_policy', true);
        else
            g_form.setDisplay('enforce_history_policy', false);
    }
}

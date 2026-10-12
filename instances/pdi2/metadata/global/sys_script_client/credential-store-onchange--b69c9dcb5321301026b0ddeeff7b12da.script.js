function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    g_form.clearMessages();
    var resetPasswordEnabled = false;
    var unlockAccountEnabled = false;
    var changePasswordEnabled = false;
    var acceptsPassword = false;
    var isUseFlowEnabled = false;
    var credStoreTypeName = '';
    var isSupportForcePassword = false;
    var isExpirationDetailFlow = false;
    var credGr = new GlideRecord("pwd_cred_store");
    credGr.get(newValue);
    var gr = new GlideRecord("pwd_cred_store_type");
    if (gr.get(credGr.type)) {
        isUseFlowEnabled = gr.use_flow == 'true';
        acceptsPassword = gr.password_delivery_mechanism == '' || gr.password_delivery_mechanism == '0';
        resetPasswordEnabled = !isUseFlowEnabled || gr.passd_reset_flow != '';
        unlockAccountEnabled = !isUseFlowEnabled || gr.unlock_user_flow != '';
        changePasswordEnabled = !isUseFlowEnabled || gr.pwd_change_flow != '';
        credStoreTypeName = gr.name.escapeHTML();
        isSupportForcePassword = gr.supports_force_password_change;
        isExpirationDetailFlow = gr.getValue("pwd_expiration_details_flow");
    }

    if (isExpirationDetailFlow) {
        g_form.setReadOnly("send_expiration_reminder", false);
    } else {
        g_form.setValue("send_expiration_reminder", false);
        g_form.setReadOnly("send_expiration_reminder", true);
    }

    g_form.setDisplay("change", changePasswordEnabled);
    if (!changePasswordEnabled)
        g_form.setValue("change", changePasswordEnabled);
    g_form.setDisplay("reset", resetPasswordEnabled);
    if (!resetPasswordEnabled)
        g_form.setValue("reset", resetPasswordEnabled);
    g_form.setDisplay("unlock_account", unlockAccountEnabled);
    if (!unlockAccountEnabled)
        g_form.setValue("unlock_account", unlockAccountEnabled);

    if (isUseFlowEnabled)
        g_form.setDisplay("password_needs_reset", resetPasswordEnabled && isSupportForcePassword && g_form.getBooleanValue('reset') && g_form.getBooleanValue('auto_gen_password'));
    else
        g_form.setDisplay("password_needs_reset", g_form.getBooleanValue('reset') && g_form.getBooleanValue('auto_gen_password'));

    g_form.setSectionDisplay("password_resetdetails", (g_form.getBooleanValue("reset") || g_form.getBooleanValue('unlock_account')));
    g_form.setSectionDisplay("advanced", (g_form.getBooleanValue("reset") || g_form.getBooleanValue('unlock_account')));
    g_form.setSectionDisplay("enrollment_reminder", (g_form.getBooleanValue("reset") || g_form.getBooleanValue('unlock_account')));
    if (!(g_form.getBooleanValue("reset") || g_form.getBooleanValue('unlock_account')))
        g_form.hideRelatedList("pwd_map_proc_to_verification");

    var isPasswordExpirationFeatureEnabled = g_scratchpad.isPasswordExpirationFeatureEnabled;
    g_form.setSectionDisplay("password_expirationconfiguration", isUseFlowEnabled && isPasswordExpirationFeatureEnabled && (g_form.getBooleanValue("reset") || g_form.getBooleanValue('change')));

    var notSupportedFeatures = '';
    if (!resetPasswordEnabled)
        notSupportedFeatures += (getMessage("Password Reset") + ",");
    if (!unlockAccountEnabled)
        notSupportedFeatures += (getMessage("Account Unlock") + ",");
    if (!changePasswordEnabled)
        notSupportedFeatures += (getMessage("Change Password") + ",");
    if (!isPasswordExpirationFeatureEnabled)
        notSupportedFeatures += getMessage("Password Expiration");
    if (notSupportedFeatures.charAt(notSupportedFeatures.length - 1) == ",")
        notSupportedFeatures = notSupportedFeatures.substr(0, notSupportedFeatures.length - 1);

    if (isUseFlowEnabled && !(acceptsPassword && resetPasswordEnabled)) {
        notSupportedFeatures += getMessage(" and password input");
        g_form.setDisplay("auto_gen_password", false);
        g_form.setDisplay("display_password", false);
        g_form.setDisplay("send_email", false);
        g_form.setValue("auto_gen_password", false);
        g_form.setValue("display_password", false);
        g_form.setValue("send_email", false);
    } else if (!g_form.getBooleanValue("email_password_reset_url")) {
        g_form.setDisplay("auto_gen_password", true);
    }
    var msg = formatMessage(getMessage("All the fields related to {0} are hidden. Because the '{1}' doesn't support the listed features."), notSupportedFeatures, credStoreTypeName);
    if (notSupportedFeatures != '')
        g_form.addInfoMessage(msg);
}

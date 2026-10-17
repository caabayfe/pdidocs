function onLoad() {
    var credentialStore = g_form.getReference("cred_store");
    var resetPasswordEnabled = false;
    var unlockAccountEnabled = false;
    var changePasswordEnabled = false;
    var acceptsPassword = false;
    var isUseFlowEnabled = false;
    var credStoreTypeName = '';
    var isSupportForcePassword = false;
    var grType = new GlideRecord("pwd_cred_store_type");
    if (grType.get(credentialStore.type)) {
        isUseFlowEnabled = grType.use_flow == 'true';
        acceptsPassword = grType.password_delivery_mechanism == '' || grType.password_delivery_mechanism == '0';
        resetPasswordEnabled = !isUseFlowEnabled || grType.passd_reset_flow != '';
        unlockAccountEnabled = !isUseFlowEnabled || grType.unlock_user_flow != '';
        changePasswordEnabled = !isUseFlowEnabled || grType.pwd_change_flow != '';
        credStoreTypeName = grType.name.escapeHTML();
        isSupportForcePassword = grType.supports_force_password_change;
    }
    g_form.setDisplay("change", changePasswordEnabled);
    if (!changePasswordEnabled)
        g_form.setValue("change", false);

    g_form.setDisplay("reset", resetPasswordEnabled);
    if (!resetPasswordEnabled)
        g_form.setValue("reset", false);

    g_form.setDisplay("unlock_account", unlockAccountEnabled);
    if (!unlockAccountEnabled)
        g_form.setValue("unlock_account", false);

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
        g_form.setValue("auto_gen_password", false);
        g_form.setValue("display_password", false);
        g_form.setValue("send_email", false);
        g_form.setDisplay("auto_gen_password", false);
        g_form.setDisplay("display_password", false);
        g_form.setDisplay("send_email", false);
    }
    var msg = formatMessage(getMessage("All the fields related to {0} are hidden. Because the '{1}' doesn't support the listed features."), notSupportedFeatures, credStoreTypeName);
    if (notSupportedFeatures != '' && !g_form.isNewRecord())
        g_form.addInfoMessage(msg);
}

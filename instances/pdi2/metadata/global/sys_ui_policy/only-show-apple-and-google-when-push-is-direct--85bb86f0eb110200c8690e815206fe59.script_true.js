function onCondition() {
    g_form.setDisplay('apple_auth_type', true);
    g_form.setDisplay('fcm_auth_type', true);
    if (g_form.getValue('apple_auth_type') == 'token_based') {
        g_form.setSectionDisplay('appletoken_basedauthentication', true);
        g_form.setSectionDisplay('applecertificate_basedauthentication', false);
    } else {
        g_form.setSectionDisplay('applecertificate_basedauthentication', true);
        g_form.setSectionDisplay('appletoken_basedauthentication', false);
    }
    if (g_form.getValue('fcm_auth_type') == 'oauth') {
        g_form.setSectionDisplay('googlehttp_v1api', true);
        g_form.setSectionDisplay('googleapi_key', false);
    } else {
        g_form.setSectionDisplay('googleapi_key', true);
        g_form.setSectionDisplay('googlehttp_v1api', false);
    }

    g_form.removeOption('apple_auth_type', '', '-- None --');
    g_form.removeOption('fcm_auth_type', '', '-- None --');
}

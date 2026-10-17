function onCondition() {
    var currentView = getView();
    if (currentView == 'oauth_oidc_provider') {
        g_form.setMandatory('client_secret', false);
        if (g_form.isNewRecord())
            g_form.setDisplay('client_secret', false);
    }
}

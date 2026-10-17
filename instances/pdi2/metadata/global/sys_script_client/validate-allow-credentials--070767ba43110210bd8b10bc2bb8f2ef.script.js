function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var isAllowedCredentialsSelected = newValue == "true";
    var domain = g_form.getValue('domain');
    var isWildCardDomain = domain.length == 1 && domain.indexOf('*') > -1;
    if (isAllowedCredentialsSelected && isWildCardDomain)
        g_form.showFieldMsg(control, "Access-Control-Allow-Credentials is not allowed for wildcard (*) domains.", "error");
    else
        g_form.hideFieldMsg(control, "true");

}

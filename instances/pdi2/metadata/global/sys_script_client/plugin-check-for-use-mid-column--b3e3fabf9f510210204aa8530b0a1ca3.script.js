function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    if (newValue == 'true') {
        var oauthConsumerSupport = new GlideAjax('OAuthConsumerSupport');
        oauthConsumerSupport.addParam('sysparm_name', 'isOAuthViaMidActive');
        oauthConsumerSupport.getXMLWait();
        if (oauthConsumerSupport.getAnswer() == 'false') {
            g_form.addErrorMessage(getMessage("Install the 'OAuth 2.0 via MID' plugin to use the 'Connect to Auth Server via MID' option."));
            g_form.setValue('use_mid', false);
        }
    }
}

function onLoad() {
    if (g_form.getValue('use_mid') == 'true') {
        var oauthConsumerSupport = new GlideAjax('OAuthConsumerSupport');
        oauthConsumerSupport.addParam('sysparm_name', 'isOAuthViaMidActive');
        oauthConsumerSupport.getXMLWait();
        if (oauthConsumerSupport.getAnswer() == 'false')
            g_form.addWarningMessage(getMessage("Install the 'OAuth 2.0 via MID' plugin to use the 'Connect to Auth Server via MID' field."));
    }
}

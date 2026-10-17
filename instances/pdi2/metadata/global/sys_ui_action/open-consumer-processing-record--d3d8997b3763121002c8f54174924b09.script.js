function onClick() {
    try {
        var subscriptionSysId = g_form.getUniqueValue();
        var ga = new GlideAjax('StreamConnectClientCallableUtils');
        ga.addParam('sysparm_name', 'getConsumerUrl');
        ga.addParam('sysparm_subscription_sysid', subscriptionSysId);
        ga.getXMLAnswer(getUrl);
    } catch (e) {
        g_form.addErrorMessage(getMessage("An error occurred: {0}", e.message));
    }
}

function getUrl(response) {
    try {
        var data = JSON.parse(response);
        if (data && data.url) {
            window.open(data.url, '_blank');
        } else if (data.error) {
            g_form.addErrorMessage(data.error);
        } else {
            g_form.addErrorMessage(getMessage("Could not determine navigation URL."));
        }
    } catch (e) {
        g_form.addErrorMessage(getMessage("Failed to parse response: {0}", e.message));
    }
}

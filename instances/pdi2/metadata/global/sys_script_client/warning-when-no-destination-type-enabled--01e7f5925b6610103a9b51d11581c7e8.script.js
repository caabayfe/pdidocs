function onLoad() {
    if (g_form.isNewRecord())
        return;
    var ajax = new GlideAjax('NotificationProviderUtil');
    ajax.addParam('sysparm_name', 'doesContentHaveDestinationTypeEnabled');
    ajax.addParam('sysparm_notification_id', g_form.getUniqueValue());
    ajax.getXMLAnswer(responseCallBack);
}

function responseCallBack(response) {
    var result = JSON.parse(response);
    if (!result.isEnabled) {
        var gwt = new GwtMessage();
        if (result.reason == "provider_not_exists") {
            g_form.addInfoMessage(gwt.getMessage("Provider content is not available for this notification."));
        } else if (result.reason == "provider_not_active") {
            g_form.addInfoMessage(gwt.getMessage("Content for provider '{0}' will not be sent. The provider is inactive.", result.provider_name));
        } else if (result.reason == "channel_not_exist") {
            g_form.addInfoMessage(gwt.getMessage("Content for provider '{0}' will not be sent. Notification Channels are inactive.", result.provider_name));
        } else if (result.reason == "destination_type_not_exist") {
            g_form.addInfoMessage(gwt.getMessage("Content for provider '{0}' will not be sent. No destination types associated with that provider are configured to send.", result.provider_name));
        } else if (result.reason == "destination_type_send_by_default_false") {
            g_form.addInfoMessage(gwt.getMessage("Content for provider '{0}' will not be sent. Send By Default flag for Destination Type is set as false.", result.provider_name));
        } else if (result.reason == "destination_type_setting_send_false") {
            g_form.addInfoMessage(gwt.getMessage("Content for provider '{0}' will not be sent. Send flag for Destination Setting is set as false.", result.provider_name));
        }
    }
}

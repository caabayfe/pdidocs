(function executeRule(current, previous /*null when async*/ ) {

    var notification_provider = getNProviderByVAChannelType();

    //Create a notification channel for this provider
    var gr = new GlideRecord("sys_notification_channel");
    gr.initialize();
    gr.setValue("name", current.getValue("name") + " Notification Channel");
    gr.setValue("active", false);
    gr.setValue("provider", notification_provider);
    gr.insert();

    //mapping record for provider to notification channel - here we have notification provider as it was needed in paris
    var config_gr = new GlideRecord("sys_cs_notification_channel_configuration");
    config_gr.initialize();
    config_gr.setValue("notification_channel", gr.getUniqueValue());
    config_gr.setValue("notification_provider", notification_provider);
    config_gr.setValue("provider", current.getUniqueValue());
    config_gr.setValue("channel", current.getValue("channel"));
    config_gr.insert();

    //create destination type for this provider
    var destination_type_gr = new GlideRecord("sys_notif_destination_type");
    destination_type_gr.initialize();
    destination_type_gr.setValue("name", current.getValue("name"));
    destination_type_gr.setValue("active", true);
    destination_type_gr.setValue("channel", gr.getUniqueValue());
    destination_type_gr.setValue("send_by_default", true);
    destination_type_gr.insert();

    function getNProviderByVAChannelType() {
        if (current.getDisplayValue("channel.type") == "Chat")
            return "dfd16d88531610109686ddeeff7b126b"; //chat notification provider
        else if (current.getDisplayValue("channel.type") == "Messaging")
            return "2527f193539310109686ddeeff7b1209"; //messaging notification provider
    }

})(current, previous);

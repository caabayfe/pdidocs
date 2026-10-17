(function executeRule(current, previous /*null when async*/ ) {

    var config_gr = new GlideRecord("sys_cs_notification_channel_configuration");
    config_gr.get("provider", current.getUniqueValue());
    
    var channel_gr = new GlideRecord("sys_notification_channel");
    channel_gr.get(config_gr.getValue("notification_channel"));

    var destination_type_gr = new GlideRecord("sys_notif_destination_type");
    destination_type_gr.get("channel", channel_gr.getUniqueValue());

    destination_type_gr.deleteRecord();       //Delete destination type for this provider
    channel_gr.deleteRecord();                //Delete notification channel for this provider
    config_gr.deleteRecord();                 //Delete mapping record for provider to notification channel

})(current, previous);

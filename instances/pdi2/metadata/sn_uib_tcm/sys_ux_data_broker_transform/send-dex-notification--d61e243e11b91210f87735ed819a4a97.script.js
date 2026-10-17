function transform(input) {
    if (!input || !input.commTaskSysId || !input.table || !input.channelPayload || !input.channelPayload['dex_desktop_assistant'])
        return;
    var output = {};
    var channelPayload = input.channelPayload['dex_desktop_assistant'];
    var recipientList = "";
    for (var i = 0; i < channelPayload.recipients.length; i++) {
        recipientList += channelPayload.recipients[i].id;
        if (i < channelPayload.recipients.length - 1) {
            recipientList += ",";
        }
    }
    var notificationObj = {
        source: "MIM",
        notification_message: channelPayload.message,
        notification_title: channelPayload.title,
        recipient_list: recipientList,
        referrer_table: input.table,
        referrer_id: input.commTaskSysId
    };
    var notify = new sn_dex_desktop.DesktopAppNotificationUtils();
    var notificationResponse = notify.sendDANotification(notificationObj);
    if (notificationResponse) {
        output.notificationResponse = notificationResponse;
    }
    return output;

}

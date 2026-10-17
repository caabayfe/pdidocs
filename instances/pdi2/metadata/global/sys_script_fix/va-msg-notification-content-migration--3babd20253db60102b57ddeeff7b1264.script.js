removeMandatoryCondition("connection");
removeMandatoryCondition("from_identity");

var grNotificationContent = new GlideRecord('sys_notification_va_content_messaging');
grNotificationContent.query();
while (grNotificationContent.next()) {
    var grDeliveryChannel = new GlideRecord('sys_cs_notification_delivery_channel');
    grDeliveryChannel.intialize();
    grDeliveryChannel.setValue('notification_content', grNotificationContent.getUniqueValue());
    grDeliveryChannel.setValue('connection', grNotificationContent.getValue('connection'));
    grDeliveryChannel.setValue('from_identity', grNotificationContent.getValue('from_identity'));
    grDeliveryChannel.setValue('to_table', 'sys_user');
    grDeliveryChannel.setValue('to_field', grNotificationContent.getValue('to_field'));
    grDeliveryChannel.setValue('active', true);
    grDeliveryChannel.insert();

    grNotificationContent.setValue('connection', '');
    grNotificationContent.setValue('from_identity', '');
    grNotificationContent.setValue('to_field', '');
    grNotificationContent.update();
}


function removeMandatoryCondition(fieldName) {
    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", "sys_notification_va_content_messaging");
    gr.addQuery("element", fieldName);
    gr.query();
    if (gr.next()) {
        gr.setValue("mandatory", false);
        gr.update();
    }
}

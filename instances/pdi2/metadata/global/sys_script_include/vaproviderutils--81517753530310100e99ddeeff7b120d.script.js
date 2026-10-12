var VAProviderUtils = Class.create();
var providerTable = 'sys_cs_provider_application';
var botMessageTable = 'sys_cs_bot_messages';

VAProviderUtils.prototype = {
    initialize: function() {},
    deleteOldNotificationRecords: function(oldNotificationChannelsysId) {

        var channel_gr = new GlideRecord("sys_notification_channel");
        channel_gr.get(oldNotificationChannelsysId);

        var provider_gr = new GlideRecord("sys_notification_provider");
        provider_gr.get(channel_gr.getValue("provider"));

        channel_gr.deleteRecord();
        provider_gr.deleteRecord();
    },
    updateNewNotificationChannelAsOld: function(oldNotificationChannelsysId, newNotificationChannelsysId, vaChannelSysId) {
        var old_channel_gr = new GlideRecord("sys_notification_channel");
        old_channel_gr.get(oldNotificationChannelsysId);

        var gr = new GlideRecord("sys_cs_channel");
        gr.get(vaChannelSysId);
        gr.setValue("enable_notification", old_channel_gr.getValue("active"));
        gr.update();

        var new_channel_gr = new GlideRecord("sys_notification_channel");
        new_channel_gr.get(newNotificationChannelsysId);
        new_channel_gr.setValue("active", old_channel_gr.getValue("active"));
        new_channel_gr.update();
    },
	
	insertBotMessage: function(providerAppId, botMessage) {
        var botMessageGr = new GlideRecord(botMessageTable);
        botMessageGr.initialize();
        botMessageGr.setValue(providerTable, providerAppId);
        botMessageGr.setValue('name', botMessage.name);
        botMessageGr.setValue('value', botMessage.value);
        botMessageGr.setValue('description', botMessage.description);
        return botMessageGr.insert();
    },

    type: 'VAProviderUtils'
};

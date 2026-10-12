var VANotificationAPIHelper = Class.create();

VANotificationAPIHelper.NOTIFICATION_TABLE = "sys_notification";
VANotificationAPIHelper.NOTIFICATION_VA_CONTENT_TABLE = "sys_notification_va_content";
VANotificationAPIHelper.NOTIFICATION_VA_CONTENT_MESSAGING_TABLE = "sys_notification_va_content_messaging";
VANotificationAPIHelper.CHANNEL_TABLE = "sys_cs_channel";
VANotificationAPIHelper.NOTIFICATION_DELIVERY_CHANNEL_TABLE = "sys_cs_notification_delivery_channel";
VANotificationAPIHelper.PROVIDER_APPLICATION_TABLE = "sys_cs_provider_application";
VANotificationAPIHelper.PROVIDER_TABLE = "sys_cs_provider";
VANotificationAPIHelper.TYPE_TO_TABLE_MAP = {
    'Virtual Agent Content - Chat': 'sys_notification_va_content',
    'Virtual Agent Content - Messaging': 'sys_notification_va_content_messaging'
};


VANotificationAPIHelper.isNotificationValid = function(notificationSysId) {
    if (gs.nil(notificationSysId))
        return false;
    var notificationGr = VANotificationAPIHelper.getNotificationGr(notificationSysId);
    return notificationGr.isValidRecord();
};

VANotificationAPIHelper.getNotificationGr = function(notificationSysId) {
    var notificationGr = new GlideRecordSecure(VANotificationAPIHelper.NOTIFICATION_TABLE);
    notificationGr.get(notificationSysId);
    return notificationGr;
};

VANotificationAPIHelper.isVAContentValid = function(contentId) {
    var contentGr = new GlideRecordSecure(VANotificationAPIHelper.NOTIFICATION_VA_CONTENT_TABLE);
    contentGr.get(contentId);
    return contentGr.isValidRecord();
};

VANotificationAPIHelper.getVAContentType = function(contentId) {
    var contentGr = new GlideRecordSecure(VANotificationAPIHelper.NOTIFICATION_VA_CONTENT_TABLE);
    contentGr.get(contentId);
    if (contentGr.isValidRecord()) {
        var tableName = contentGr.getValue("sys_class_name");
        for (var type in VANotificationAPIHelper.TYPE_TO_TABLE_MAP) {
            if (VANotificationAPIHelper.TYPE_TO_TABLE_MAP[type] == tableName)
                return type;
        }
    }
    return '';
};

VANotificationAPIHelper.areChannelsValid = function(channelIds) {
    var channelArr = channelIds.split(",");
    var channelGA = new GlideAggregate(VANotificationAPIHelper.CHANNEL_TABLE);
    channelGA.addAggregate("COUNT");
    channelGA.addQuery("sys_id", "IN", channelArr);
    channelGA.query();
    if (channelGA.next()) {
        if (channelGA.getAggregate("COUNT") == channelArr.length)
            return true;
    }
    return false;
};

VANotificationAPIHelper.isDeliveryChannelValid = function(channelId) {
    var channelGr = new GlideRecordSecure(VANotificationAPIHelper.NOTIFICATION_DELIVERY_CHANNEL_TABLE);
    channelGr.get(channelId);
    return channelGr.isValidRecord();
};

VANotificationAPIHelper.isProviderChannelIdentityValidForConnection = function(identityId, providerChannelId) {
    var identityGr = new GlideRecordSecure(VANotificationAPIHelper.PROVIDER_APPLICATION_TABLE);
    identityGr.get(identityId);
    return identityGr.isValidRecord() && identityGr.getValue('provider') === providerChannelId;
};

VANotificationAPIHelper.isTableValid = function(tableName) {
    var table = new TableUtils(tableName);
    return table.tableExists();
};

VANotificationAPIHelper.isProviderChannelValidForMessagingContent = function(providerChannelId) {
    var providerChannelGr = new GlideRecordSecure(VANotificationAPIHelper.PROVIDER_TABLE);
    providerChannelGr.get(providerChannelId);
    return providerChannelGr.isValidRecord() && providerChannelGr.channel.type + '' === 'messaging';
};

VANotificationAPIHelper.isActiveContentExist = function(notificationId, contentType, contentId) {

    var existingContentGr = new GlideRecord(VANotificationAPIHelper.TYPE_TO_TABLE_MAP[contentType]);
    existingContentGr.addQuery('sys_class_name', VANotificationAPIHelper.TYPE_TO_TABLE_MAP[contentType]);
    existingContentGr.addQuery('notification', notificationId);
    existingContentGr.addActiveQuery();
    // update case
    if (!gs.nil(contentId))
        existingContentGr.addQuery('sys_id', '!=', contentId);

    existingContentGr.query();
    if (existingContentGr.hasNext())
        return true;

    return false;
};

VANotificationAPIHelper.doesMwebChannelSupportMultipleConversations = function() {
    var channelGR = new GlideRecord('sys_cs_channel');
    channelGR.addQuery('name', 'mweb');
    channelGR.query();

    var results = {};
    if (channelGR.next()) {
        results = {
            "sysId": channelGR.getValue('sys_id'),
            "mwebSupportMultipleConversations": channelGR.getValue('supports_multiple_conversations') == 1 ? true : false
        };
    } else {
        results = {
            "sysId": "",
            "mwebSupportMultipleConversations": false
        };
    }
    return results;
},

VANotificationAPIHelper.getAllChatChannels = function() {
    var sysCSChannelGr = new GlideRecord(VANotificationAPIHelper.CHANNEL_TABLE);
    sysCSChannelGr.addQuery('type', 'chat');
    sysCSChannelGr.query();
    var deliveryChannels = [];
    while (sysCSChannelGr.next())
        deliveryChannels.push(sysCSChannelGr.getUniqueValue());
    return deliveryChannels.join(',');
};

var NotificationProviderUtil = Class.create();
NotificationProviderUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    initialize: function(request, responseXML, gc) {
        global.AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
    },

    doesContentHaveDestinationTypeEnabled: function() {
        var result = {};

        var notificationSysId = this.getParameter('sysparm_notification_id');
        var tableNameArray = this._fetchProviderContentTableNames(notificationSysId);

        // If array is empty, then it may contain shared content, so no need to throw error. 
        // If there is no content at all, then another client script takes care of that condition.
        if (tableNameArray.length == 0)
            return this._createResponse(result, true, "", "");

        var provider = new GlideRecord("sys_notification_provider");
        provider.addQuery("content_table", "IN", tableNameArray.toString());
        provider.query();
        if (!provider.hasNext())
            return this._createResponse(result, false, tableNameArray.toString(), "provider_not_exists");

        while (provider.next()) {
			var providerName = provider.getValue("name");
            var tableName = String(provider.content_table);
            if (!provider.active)
                return this._createResponse(result, false, providerName, "provider_not_active");
			
            var channel = new GlideRecord("sys_notification_channel");
            channel.addQuery("provider", provider.getUniqueValue());
            channel.addActiveQuery();
            channel.query();
            if (!channel.hasNext())
                return this._createResponse(result, false, providerName, "channel_not_exist");

            while (channel.next()) {
                var destinationType = new GlideRecord('sys_notif_destination_type');
                destinationType.addQuery('channel', channel.getUniqueValue());
                destinationType.addActiveQuery();
                destinationType.query();
                if (!destinationType.hasNext())
                    return this._createResponse(result, false, providerName, "destination_type_not_exist");

                while (destinationType.next()) {
                    var destinationTypeSetting = new GlideRecord('sys_notif_dest_type_setting');
                    destinationTypeSetting.addQuery('destination_type', destinationType.getUniqueValue());
                    destinationTypeSetting.addQuery('notification', notificationSysId);
                    destinationTypeSetting.query();
                    //if not destination type setting record exists then response will be the send_by_Default flag of setting record else dig into destination setting record.
                    if (!destinationTypeSetting.hasNext()) {
                        var sendByDefault = destinationType.getValue("send_by_default");
                        return this._createResponse(result, sendByDefault == "1", providerName, sendByDefault == "1" ? "" : "destination_type_send_by_default_false");
                    } else if (destinationTypeSetting.next()) {
                        var send = destinationTypeSetting.getValue("send");
                        return this._createResponse(result, destinationTypeSetting.getValue("send") == "1", providerName, send == "1" ? "" : "destination_type_setting_send_false");
                    }
                }
            }
        }
        //for no notification content, default is ture as the warning message will be taken care by another client script
        return this._createResponse(result, true, "", "");
    },

    _createResponse: function(result, enabled, providerName, reason) {
        result.isEnabled = enabled;
        result.reason = reason;
        result.provider_name = providerName;
        return JSON.stringify(result);
    },

    _fetchProviderContentTableNames: function(notificationId) {
        var contentTableNameArray = [];
        var notificationContent = new GlideRecord("sys_notification_content");
        notificationContent.addQuery("notification", notificationId);
        notificationContent.addNotNullQuery("notification");
        notificationContent.addQuery("sys_class_name", "NOT IN", "sys_notification_actionable_prompt,sys_notification_common_content");
        notificationContent.query();
        while (notificationContent.next() && notificationContent.canRead()) {
            contentTableNameArray.push(notificationContent.getRecordClassName());
        }
        return contentTableNameArray;
    },

    type: 'NotificationProviderUtil'
});

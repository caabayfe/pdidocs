var NotifSubscriptionTableNotificationColumn = Class.create();
NotifSubscriptionTableNotificationColumn.prototype = {
    initialize: function() {},

    getSubscribableNotifications: function() {
        return this._buildSubscribableQuery('sysevent_email_action');
    },

    getSubscribableProviderNotifications: function() {
        return this._buildSubscribableQuery('sys_notification');
    },

    _buildSubscribableQuery: function(tableName) {
        var query = '';
        var appendOrCondition = false;
        var notificationRecord = new GlideRecord(tableName);
        notificationRecord.addQuery('subscribable', true);
        notificationRecord.addQuery('active', true);
        notificationRecord.orderBy("name");
        notificationRecord.query();
        while (notificationRecord.next()) {
            if (notificationRecord.canRead()) {
                if (!appendOrCondition) {
                    appendOrCondition = true;

                } else {
                    query += '^OR';
                }
                query += 'sys_id=' + notificationRecord.getUniqueValue();
            }
        }
        if (query == '')
            return 'sys_id=NaN';
        return query;
    },
    type: 'NotifSubscriptionTableNotificationColumn'
};

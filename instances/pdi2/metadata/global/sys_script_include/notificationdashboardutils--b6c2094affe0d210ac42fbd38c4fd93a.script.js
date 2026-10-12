var NotificationDashboardUtils = Class.create();
NotificationDashboardUtils.prototype = {
    initialize: function() {},
    fetchNotifRecord: function(id) {
        var notifRecord = new GlideRecord("sysevent_email_action");
        notifRecord.addQuery("sys_id", id);
        notifRecord.query();
        if (notifRecord.hasNext())
            return notifRecord.next();
    },
    fetchNotificatonDetails(list, aggregateFn) {
        if (!list || list.length == 0) {
            return;
        }

        var notificationDetails = new GlideRecord(NotificationDashboardConstants.NOTIFICATION_TABLE);
        notificationDetails.addQuery("sys_id", 'IN', list);
        notificationDetails.query();

        while (notificationDetails.next()) {
            var result = {};
            result[NotificationDashboardConstants.NOTIFICATION_SYS_ID] = notificationDetails.getUniqueValue();
            result[NotificationDashboardConstants.NOTIFICATION_NAME] = notificationDetails.getValue("name");
            result[NotificationDashboardConstants.CATEGORY_NAME] = notificationDetails.category.getDisplayValue("name");
            result[NotificationDashboardConstants.CATEGORY_SYS_ID] = notificationDetails.category;
            var table = notificationDetails.getValue("collection");
			result[NotificationDashboardConstants.TABLE_NAME] = table;
			result[NotificationDashboardConstants.TABLE_LABEL] = table ? GlideMetaData.getTableLabel(table) : "";
            aggregateFn(notificationDetails.getUniqueValue(), result);
        }
    },
    fetchPreferenceInformation(list, aggregateFn) {
        if (!list || list.length == 0) {
            return;
        }

        //fetching total preference count
        var preferenceAgg = new GlideAggregate(NotificationDashboardConstants.PREFERENCE_TABLE);
		preferenceAgg.addQuery("notification", "IN", list);
        preferenceAgg.addAggregate("COUNT(DISTINCT", "user");
        preferenceAgg.groupBy("notification");
        preferenceAgg.orderByAggregate("COUNT(DISTINCT", "user");
        preferenceAgg.query();
        while (preferenceAgg.next()) {
            var result = {};
            var notification = preferenceAgg.getValue("notification", notification);
            result[NotificationDashboardConstants.NOTIFICATION_SYS_ID] = notification;
            result[NotificationDashboardConstants.NOTIF_TOTAL_PREFERENCE_COUNT] = preferenceAgg.getAggregate("COUNT(DISTINCT", "user");
            aggregateFn(notification, result);
        }

        //fetching preference=false count
        var recipientPrefAgg = new GlideAggregate(NotificationDashboardConstants.RECIPIENT_PREFERENCE_TABLE);
    	recipientPrefAgg.addQuery("notification_table", "sysevent_email_action");
		recipientPrefAgg.addQuery("notification", "IN", list);
        recipientPrefAgg.addAggregate("count", "recipient");
        recipientPrefAgg.groupBy("notification");
        recipientPrefAgg.orderByAggregate("count", "recipient");
        recipientPrefAgg.query();
        while (recipientPrefAgg.next()) {
            result = {};
            notification = recipientPrefAgg.getValue("notification");
            result[NotificationDashboardConstants.NOTIFICATION_SYS_ID] = notification;
            result[NotificationDashboardConstants.NOTIF_PREFERENCE_OPTOUT_COUNT] = recipientPrefAgg.getAggregate("count", "recipient");
            aggregateFn(notification, result);
        }
    },
    fetchSubscriptionInformation(notificationID, requireAll) {
        var unSubscriptionDetails = new GlideAggregate(NotificationDashboardConstants.SUBSCRIPTION_TABLE);
        unSubscriptionDetails.addQuery("notification", notificationID);
		if(!requireAll)
       	 unSubscriptionDetails.addInactiveQuery();
        unSubscriptionDetails.addAggregate("COUNT", "notification");
        unSubscriptionDetails.groupBy("notification");
        unSubscriptionDetails.query();
		var result = 0;
        if (unSubscriptionDetails.next()) 
             result = unSubscriptionDetails.getAggregate("COUNT", "notification");
		return result;
    },
    fetchUserDetails: function(list, aggregateFn) {
        if (!list || list.length == 0) {
            return;
        }

        var userDetails = new GlideRecord(NotificationDashboardConstants.USER_TABLE);
        userDetails.addQuery("sys_id", 'IN', list);
        userDetails.query();

        while (userDetails.next()) {
            var result = {};
            result[NotificationDashboardConstants.USER_SYS_ID] = userDetails.getUniqueValue();
            result[NotificationDashboardConstants.USER_NAME] = userDetails.getValue("name");
            aggregateFn(userDetails.getUniqueValue(), result);
        }
    },
    fetchTableDetails: function(list, aggregateFn) {
        if (!list || list.length == 0) {
            return;
        }

        var tableDetails = new GlideRecord(NotificationDashboardConstants.TABLE_TABLE);
        tableDetails.addQuery("sys_id", 'IN', list);
        tableDetails.query();
        while (tableDetails.next()) {
            var result = {};
            result[NotificationDashboardConstants.TABLE_SYS_ID] = tableDetails.getUniqueValue();
            result[NotificationDashboardConstants.TABLE_NAME] = tableDetails.getValue("name");
            result[NotificationDashboardConstants.TABLE_LABEL] = tableDetails.getValue("label");
            aggregateFn(tableDetails.getUniqueValue(), result);
        }
    },
    getAllNotifications: function(filterCriteria) {
        var result = [];
		notif = this._queryNotificationRecords(filterCriteria);
        while (notif.next()) {
            result.push(notif.getUniqueValue());
        }
        return result;
    },
	_queryNotificationRecords: function(filterCriteria) {
        var notif = new GlideRecord(NotificationDashboardConstants.NOTIFICATION_TABLE);

        if (filterCriteria.categories && filterCriteria.categories.length > 0) {
            notif.addQuery("category", "IN", filterCriteria.categories);
        }
        if (filterCriteria.tables && filterCriteria.tables.length > 0) {
            var classNames = [];
            var tableObjects = new GlideRecord("sys_db_object");
            tableObjects.addQuery("sys_id", "IN", filterCriteria.tables);
            tableObjects.query();
            while (tableObjects.next()) {
                classNames.push(tableObjects.getValue("name"));
            }
            notif.addQuery("collection", "IN", classNames);
        }
        if (filterCriteria.state && filterCriteria.state != "all") {
            notif.addQuery("active", filterCriteria.state == "active");
        }
        if (filterCriteria.type && filterCriteria.type != 'all') {
            notif.addQuery("subscribable", "subscribed" == filterCriteria.type ? true : false);
        }
        notif.query();

		return notif;
	},
    getSubscriptionDetails: function(list, aggregateFn) {
        if (!list || list.length == 0) {
            return;
        }
        var preferenceGr = new GlideAggregate("cmn_notif_message");
        preferenceGr.addQuery("notification", "IN", list);
        preferenceGr.addAggregate("COUNT", "user");
        preferenceGr.groupBy("notification");
        preferenceGr.query();
        while (preferenceGr.next()) {
            var result = {};
            result[NotificationDashboardConstants.NOTIF_TOTAL_SUBSCRIPTION_COUNT] = preferenceGr.getAggregate("COUNT", "user");
            aggregateFn(preferenceGr.getValue("notification"), result);
        }

        var unsubscribeAgg = new GlideAggregate("cmn_notif_message");
        unsubscribeAgg.addQuery("notification", "IN", list);
        unsubscribeAgg.addQuery("notification_filter", NotificationDashboardConstants.UNSUBSCRIBED_FILTER);
        unsubscribeAgg.addAggregate("COUNT", "user");
        unsubscribeAgg.groupBy("notification");
        unsubscribeAgg.query();
        while (unsubscribeAgg.next()) {
            var result1 = {};
            result1[NotificationDashboardConstants.NOTIF_SUBSCRIPTION_OPTOUT_COUNT] = unsubscribeAgg.getAggregate("COUNT", "user");
            aggregateFn(unsubscribeAgg.getValue("notification"), result1);
        }
    },

    fetchUnusedNotifications: function(filter) {
        var emailLogAgg = new GlideAggregate('sys_email_log');
        emailLogAgg.addQuery('sys_created_on', '>=', new GlideDateTime(filter.startDate));
        var endDate =  new GlideDateTime(filter.endDate);
		endDate.addDays(1);
		emailLogAgg.addQuery('sys_created_on', '<', endDate);
        emailLogAgg.addAggregate('COUNT', 'notification');
        emailLogAgg.query();

        var used = {};
        while (emailLogAgg.next()) {
			var notification = emailLogAgg.getValue('notification');
            used[notification] = true;
        }
        var notifRecords = this._queryNotificationRecords(filter);
        var unused = [];
        while (notifRecords.next()) {
			if (!used[notifRecords.getUniqueValue()]) {
                unused.push(notifRecords.getUniqueValue());
            }
        }
        return unused;
    },

    fetchNotificationsInfo: function(dateJSON) {
        var startDate = dateJSON.startDate ? dateJSON.startDate : '2024-05-31';
        var endDate = dateJSON.endDate ? dateJSON.endDate : '2024-09-01';

        var startDateTime = new GlideDateTime(startDate);
        var endDateTime = new GlideDateTime(endDate);
        var emailActionGR = new GlideRecord('sysevent_email_action');
        emailActionGR.query();
        var result = {};
        result.totalRowCount = emailActionGR.getRowCount();

        emailActionGR.addQuery('active', true);
        emailActionGR.query();
        result.activeRowCount = emailActionGR.getRowCount();

        return result;
    },
    getTopOptedOutNotifications: function(count, filter) {
        var result = [];
        var recipientPreferenceAgg = new GlideAggregate(NotificationDashboardConstants.RECIPIENT_PREFERENCE_TABLE);
        //unsubscribe filter
        recipientPreferenceAgg.addQuery("send", false);
		recipientPreferenceAgg.addQuery("notification_table", "sysevent_email_action");
        recipientPreferenceAgg.addQuery('sys_updated_on', '>=', new GlideDateTime(filter.startDate));
        recipientPreferenceAgg.addQuery('sys_updated_on', '<=', new GlideDateTime(filter.endDate));
        recipientPreferenceAgg.addAggregate("count", "notification");
        recipientPreferenceAgg.groupBy("notification");
        recipientPreferenceAgg.orderByAggregate("count", "notification");
        recipientPreferenceAgg.query();

		var notifRecords = this._queryNotificationRecords(filter);
		var notifMap = {};
		while (notifRecords.next()) {
			notifMap[notifRecords.getUniqueValue()] = true;
		}
		
		while((result.length < count) && recipientPreferenceAgg.next()) {
			var notification = recipientPreferenceAgg.getValue("notification");
			if (notifMap[notification]) {
				result.push(notification);	
			}
		}
        return result;
    },

	getOptedOutInfoByNotificationID: function(filter){
		var totalPreferenceCount = 0;
		var unsubscribedPreferenceCount = 0;
		var preferenceAgg = new GlideAggregate(NotificationDashboardConstants.PREFERENCE_TABLE);
		preferenceAgg.addAggregate("COUNT(DISTINCT", "user");
        preferenceAgg.addQuery("notification", filter.notificationID);
        preferenceAgg.query();
        if (preferenceAgg.next()) {
            totalPreferenceCount = preferenceAgg.getRowCount();
		}
   
        //fetching preference=false count
        var recipientPreferenceAgg = new GlideAggregate(NotificationDashboardConstants.RECIPIENT_PREFERENCE_TABLE);
		recipientPreferenceAgg.addQuery("notification_table", "sysevent_email_action");
		recipientPreferenceAgg.addQuery("notification", filter.notificationID);
		recipientPreferenceAgg.addQuery('sys_updated_on', '>=', new GlideDateTime(filter.startDate));
        recipientPreferenceAgg.addQuery('sys_updated_on', '<=', new GlideDateTime(filter.endDate));
		recipientPreferenceAgg.addQuery('send', false);
        recipientPreferenceAgg.addAggregate("count", "recipient");
        recipientPreferenceAgg.query();
        if (recipientPreferenceAgg.next()) {
            unsubscribedPreferenceCount = recipientPreferenceAgg.getAggregate("count", "recipient");
        }
		var result = {
			"data": unsubscribedPreferenceCount + "/" + totalPreferenceCount
		};
		return [result];
	},

    fetchNewNotifications: function(dateJSON) {
        var startDate = dateJSON.startDate ? dateJSON.startDate : '2024-05-31';
        var endDate = dateJSON.endDate ? dateJSON.endDate : '2024-09-01';

        var startDateTime = new GlideDateTime(startDate);
        var endDateTime = new GlideDateTime(endDate);
        var emailActionGR = new GlideRecord('sysevent_email_action');
        emailActionGR.addQuery('sys_created_on', '>=', startDateTime);
        emailActionGR.addQuery('sys_created_on', '<=', endDateTime);
        emailActionGR.query();
        var result = {};
        result.totalRowCount = emailActionGR.getRowCount();
        return result;
    },
    fetchCategoryDetails: function(list, aggregateFn) {
        if (!list || list.length == 0) {
            return;
        }

        var categoryDetails = new GlideRecord(NotificationDashboardConstants.CATEGORY_TABLE);
        categoryDetails.addQuery("sys_id", 'IN', list);
        categoryDetails.query();
        while (categoryDetails.next()) {
            var result = {};
            result[NotificationDashboardConstants.CATEGORY_SYS_ID] = categoryDetails.getUniqueValue();
            result[NotificationDashboardConstants.CATEGORY_NAME] = categoryDetails.getDisplayValue("name");
            result[NotificationDashboardConstants.CATEGORY_LABEL] = categoryDetails.getValue("label");
            aggregateFn(categoryDetails.getUniqueValue(), result);
        }
    },
    type: 'NotificationDashboardUtils'
};

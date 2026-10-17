var MobilePushNotificationHelper = Class.create();
MobilePushNotificationHelper.prototype = {
	initialize: function() {},

	getMessagesNeedingNotification: function(consumerAccountId, lastReadMessageId) {	
		// Get any unread messages for this consumer account that is after the last marked read message
		// These are returned in ascending order
		var unreadMessageIds = sn_cs.VASystemObject.getUnreadMessageIdsForConsumerAccount(consumerAccountId, lastReadMessageId);
		var lastNotification = this.getLastNotificationForConsumer(consumerAccountId);
		var messageIdForLastNotification = lastNotification != null ? lastNotification.getValue('message_id') : null;

		// No previous notification --> send notifications for all unread messages
		if(messageIdForLastNotification == null) {
			return unreadMessageIds;
		}

		// None of the unread messages have had a previous notification
		var index = unreadMessageIds.indexOf(messageIdForLastNotification);
		if(index == -1) {
			return unreadMessageIds;
		}

		var messagesPendingNotification = [];

		// Find every message after the last notification and add to list for pending notifications
		for(var i = index + 1; i < unreadMessageIds.length; i++) {
			messagesPendingNotification.push(unreadMessageIds[i]);
		}

		return messagesPendingNotification;
	},

	getLastNotificationForConsumer: function(consumerAccountId) {
		if (!gs.tableExists('sys_cs_message_notification')) {
			return null;
		}

		var lastNotificationGR = new GlideRecord('sys_cs_message_notification');
		lastNotificationGR.addQuery('consumer_account_id', consumerAccountId);
		lastNotificationGR.orderByDesc('message_id.sequence');
		lastNotificationGR.setLimit(1);
		lastNotificationGR.query();

		return lastNotificationGR.next() ? lastNotificationGR : null;
	},

	generateNotifications: function(consumerAccountId, messageIds, userId) {
		if (!gs.tableExists('sys_cs_message_notification')) {
			return;
		}	

		var pushNotifTitle = sn_cs.VASystemObject.getChatHeader();
		for(var i = 0; i < messageIds.length; i++) {
			var notificationGR = new GlideRecord('sys_cs_message_notification');
			notificationGR.setValue('consumer_account_id', consumerAccountId);
			notificationGR.setValue('message_id', messageIds[i]);
			notificationGR.setValue('push_title', pushNotifTitle);
			notificationGR.setValue('user_id', userId);
			notificationGR.insert();
		}
	},

	getConsumerAccountsWithPushRegistered: function() {
		var consumerAccounts = [];
		if (!gs.tableExists('sys_push_notif_app_install')) {
			return consumerAccounts;
		}

		var pushNotifsGR = new GlideRecord('sysevent_email_action');	
		if (!pushNotifsGR.get('32a0d05153b130103296ddeeff7b127d'))
			return consumerAccounts;

		var pushMessages = pushNotifsGR.getValue('message_list');
		var pushAppGR = new GlideRecord('sys_push_notif_msg');
		pushAppGR.addQuery('sys_id', 'IN', pushMessages);
		pushAppGR.query();

		var pushApps = [];
		while (pushAppGR.next()) {
			pushApps.push(pushAppGR.getValue('push_app'));
		}

		// Get Child Apps
		var childPushAppGR = new GlideRecord('sys_push_application');
		childPushAppGR.addQuery('parent_app', 'IN', pushApps);
		childPushAppGR.addActiveQuery();
		childPushAppGR.query();

		while (childPushAppGR.next()) {
			pushApps.push(childPushAppGR.getUniqueValue());
		}

		var pushRegGR = new GlideRecord('sys_push_notif_app_install');
		pushRegGR.addQuery('sys_push_application_id', 'IN', pushApps);
		pushRegGR.addActiveQuery();
		pushRegGR.query();

		var usersWithPush = [];
		while(pushRegGR.next()) {
			usersWithPush.push(pushRegGR.getValue('sys_user_id'));	
		}

		var consumerGR = new GlideRecord('sys_cs_consumer');
		consumerGR.addQuery('user_id', 'IN', usersWithPush);
		consumerGR.query();

		var consumers = [];
		while(consumerGR.next()) {
			consumers.push(consumerGR.getUniqueValue());
		}

		var consumerAccountsGR = new GlideRecord('sys_cs_consumer_account');
		consumerAccountsGR.addQuery('consumer', 'IN', consumers);
		consumerAccountsGR.query();

		while(consumerAccountsGR.next()) {
			consumerAccounts.push(consumerAccountsGR.getUniqueValue());
		}

		return consumerAccounts;
	},

	type: 'MobilePushNotificationHelper'		
};

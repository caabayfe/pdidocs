var NotificationUnsubscribe = Class.create();
NotificationUnsubscribe.prototype = {

	unsubscribe: function(notification, notificationType) {
	   this._recordGCFEvent('email_unsubscribe_metric');

		// Only attempt to unsubscribe if the notificaiton exists
		var result = this._validateNotification(notification);
		if (result.notificationExists !== 'true') {
			gs.warn('Attempt to unsubscribe user ' + gs.getUserName() + ' failed ' +
					'because notification (' + notification + ') does not exist', 'NotificationUnsubscribe');
			return {
				'notificationName' : '',
				'header' : gs.getMessage('Unsubscribe Failed'),
				'message' : gs.getMessage('Cannot unsubscribe because the notification was not found on this system.')
			};
		}
		
		var userId = gs.getUserID();
		
		// Unsubscribe from subscriptions
		var subscriptionCount = this._sysNotifSubscriptionUnsubscribe(notification, notificationType, userId);
		
		// Mandatory notifications can't be disabled from preferences
		if (result.mandatory === 'true') {
			return {
				'notificationName' : result.notificationName,
				'header' : gs.getMessage('Notification marked Mandatory'),
				'message' : gs.getMessage('We unsubscribed you from the notification {0}, however as it is mandatory you may still receive it.', result.notificationName)
			};
		}
		
		// Unsubscribe from cmn_notif_devices
		var messageCount = this._cmnNotifMessageUnsubscribe(notificationType, userId, notification);

		if (subscriptionCount < 1 && messageCount < 1) {
			return {
				'notificationName' : result.notificationName,
				'header' : gs.getMessage('Unsubscribe Failed'),				
				'message' : gs.getMessage('There is no record of you receiving the {0} notification.', result.notificationName)
			};
		}

		this._recordGCFEvent('email_unsubscribe_success_metric');

		return {
			'notificationName' : result.notificationName,
			'header' : gs.getMessage('Unsubscribe Successful'),
			'message' : gs.getMessage('You have unsubscribed from the notification {0}.', result.notificationName)
		};
	},

    /**
     This method unsubscribes users from the notification sent from their secondary email addresses. Customers who modified this script need to use this accordingly.
    **/
	unsubscribeSecondaryEmailDevice: function(notification, notificationType, secondaryEmail) {
		this._recordGCFEvent('email_unsubscribe_metric');
		// Only attempt to unsubscribe if the notificaiton exists
		var result = this._validateNotification(notification);
		if (result.notificationExists !== 'true') {
			gs.warn('Attempt to unsubscribe user ' + gs.getUserName() + ' failed ' +
					'because notification (' + notification + ') does not exist', 'NotificationUnsubscribe');
			return {
				'notificationName' : '',
				'header' : gs.getMessage('Unsubscribe Failed'),
				'message' : gs.getMessage('Cannot unsubscribe because the notification was not found on this system.')
			};
		}
		var userId = this._getUserFromSecondaryDevice(secondaryEmail);

		if(userId == null){
		    return {
				'notificationName' : result.notificationName,
				'header' : gs.getMessage('Unsubscribe Failed'),
				'message' : gs.getMessage('There is no record of you receiving the {0} notification.', result.notificationName)
			};
		}

		// Unsubscribe from subscriptions
		var subscriptionCount = this._sysNotifSubscriptionUnsubscribeSecondaryDevice(notification, notificationType, userId, secondaryEmail);

		// Mandatory notifications can't be disabled from preferences
		if (result.mandatory === 'true') {
			return {
				'notificationName' : result.notificationName,
				'header' : gs.getMessage('Notification marked Mandatory'),
				'message' : gs.getMessage('We unsubscribed you from the notification {0}, however as it is mandatory you may still receive it.', result.notificationName)
			};
		}
		// Unsubscribe from cmn_notif_devices
		var messageCount = this._cmnNotifMessageUnsubscribeSecondaryDevice(notificationType,userId,notification,secondaryEmail);
		if (subscriptionCount < 1 && messageCount < 1) {
			return {
				'notificationName' : result.notificationName,
				'header' : gs.getMessage('Unsubscribe Failed'),
				'message' : gs.getMessage('There is no record of you receiving the {0} notification.', result.notificationName)
			};
		}

		this._recordGCFEvent('email_unsubscribe_success_metric');
		return {
			'notificationName' : result.notificationName,
			'header' : gs.getMessage('Unsubscribe Successful'),
			'message' : gs.getMessage('You have unsubscribed from the notification {0}.', result.notificationName)
		};
	},
	
	_validateNotification: function(notification) {
		var notificationGR = new GlideRecord('sysevent_email_action');
		if (!notificationGR.get(notification)) {
			return {
				notificationExists : 'false'
			};
		}

		if (notificationGR.mandatory || notificationGR.force_delivery) {
			return {
				notificationExists : 'true',
				mandatory : 'true',
				notificationName : notificationGR.getValue('name')
			};
		}
		
		return {
			notificationExists : 'true',
			mandatory : 'false',
			notificationName : notificationGR.getValue('name')
		};
	},
	
	_sysNotifSubscriptionUnsubscribe: function(notification, notificationType, userId) {
		var subscriptionGR = new GlideRecord('sys_notif_subscription');
		subscriptionGR.addQuery('notification', notification);
		subscriptionGR.addQuery('user', userId);
		subscriptionGR.query();

		var emailDevicesGR = new GlideRecord('cmn_notif_device');
		emailDevicesGR.addQuery('user', userId);
		if (notificationType == 'email')
			emailDevicesGR.addQuery('type', 'Email');
		emailDevicesGR.query();

		// Save off the sys_ids of all the devices that need to be removed from the subscription
		var emailDevices = [];
		while (emailDevicesGR.next()) {
			emailDevices.push(emailDevicesGR.getUniqueValue());
		}

		// Remove the devices from all appropriate subscriptions
		var totalRowsAffected = 0;
		while (subscriptionGR.next()) {
			var devices = subscriptionGR.getValue('devices');
			if (devices) {
				devicesWithEmailRemoved = this._removeMatchingValues(emailDevices, devices.split(','));
				if (devices.length != devicesWithEmailRemoved.length) {
					totalRowsAffected += 1;
				}
				subscriptionGR.setValue('devices', devicesWithEmailRemoved);
				subscriptionGR.update();
			}
		}
		
		return totalRowsAffected;
	},
	
	_cmnNotifMessageUnsubscribe: function(notificationType, userId, notification) {
		var UNSUBSCRIBE_FILTER_SYS_ID ='c1bfa4040a0a0b8b001eeb0f3f5ee961';
		var cmnNotifMessageGR = new GlideRecord('cmn_notif_message');
		var deviceList = this._getDeviceList(notificationType, userId);
		cmnNotifMessageGR.addQuery('device', 'IN', deviceList);
		cmnNotifMessageGR.addQuery('notification', notification);
		cmnNotifMessageGR.addQuery('user', userId);
		cmnNotifMessageGR.query();
		var rowCount = cmnNotifMessageGR.getRowCount();
		cmnNotifMessageGR.setValue('notification_filter', UNSUBSCRIBE_FILTER_SYS_ID);
		cmnNotifMessageGR.updateMultiple();
		return rowCount;
	},

	_sysNotifSubscriptionUnsubscribeSecondaryDevice: function(notification, notificationType, userId, emailAddress) {
		var subscriptionGR = new GlideRecord('sys_notif_subscription');
		subscriptionGR.addQuery('notification', notification);
		subscriptionGR.addQuery('user', userId);
		subscriptionGR.query();

		var emailDevicesGR = new GlideRecord('cmn_notif_device');
		emailDevicesGR.addQuery('user', userId);
		emailDevicesGR.addQuery('type', 'Email');
		emailDevicesGR.addQuery('email_address', emailAddress);
		emailDevicesGR.query();

		// Save off the sys_ids of all the devices that need to be removed from the subscription
		var emailDevices = [];
		while (emailDevicesGR.next()) {
			emailDevices.push(emailDevicesGR.getUniqueValue());
		}

		// Remove the devices from all appropriate subscriptions
		var totalRowsAffected = 0;
		while (subscriptionGR.next()) {
			var devices = subscriptionGR.getValue('devices');
			if (devices) {
				devicesWithEmailRemoved = this._removeMatchingValues(emailDevices, devices.split(','));
				if (devices.length != devicesWithEmailRemoved.length) {
					totalRowsAffected += 1;
				}
				subscriptionGR.setValue('devices', devicesWithEmailRemoved);
				subscriptionGR.update();
			}
		}
		return totalRowsAffected;
	},

	_cmnNotifMessageUnsubscribeSecondaryDevice: function(notificationType, userId, notification, emailAddress) {
		var UNSUBSCRIBE_FILTER_SYS_ID ='c1bfa4040a0a0b8b001eeb0f3f5ee961';
		var cmnNotifMessageGR = new GlideRecord('cmn_notif_message');
		cmnNotifMessageGR.addQuery('device.email_address', emailAddress);
		cmnNotifMessageGR.addQuery('notification', notification);
		cmnNotifMessageGR.addQuery('user', userId);
		cmnNotifMessageGR.query();
		var rowCount = cmnNotifMessageGR.getRowCount();
        cmnNotifMessageGR.setValue('notification_filter', UNSUBSCRIBE_FILTER_SYS_ID);
		cmnNotifMessageGR.updateMultiple();
		return rowCount;
	},

	_removeMatchingValues: function(valuesToRemove, values) {
		var arrayUtil = new ArrayUtil();
		return arrayUtil.diff(values, valuesToRemove);
	},

	_getUserFromSecondaryDevice : function(emailAddress){
		var notifDevice = new GlideRecord("cmn_notif_device");
		notifDevice.addQuery("primary_email", false);
		notifDevice.addQuery("type", "Email");
		notifDevice.addActiveQuery();
		notifDevice.addQuery("email_address", emailAddress);
		notifDevice.addNotNullQuery("user");
		//We will return only one match, so setting the limit to one.
		notifDevice.setLimit(1);
		notifDevice.query();
		if (notifDevice.next())
			return notifDevice.getValue("user");
		return null;
    },

    _recordGCFEvent: function(metricName){
        var sm = new GCFSampleMap();
	    sm.put('dummy_key', "0");
		GCFCollector.recordUsageEvent('notifications', 'notification_analytics',
                metricName, sm);
    },

	_getDeviceList: function(deviceTypes, userId) {
		var deviceGR = new GlideRecord('cmn_notif_device');
		deviceGR.addQuery('user', userId);
		if (deviceTypes === 'email')
			deviceGR.addQuery('type', 'Email');
		deviceGR.query();
		
		var result = [];
		while (deviceGR.next()) {
			result.push(deviceGR.getValue('sys_id'));
		}

		return result;
	},
	
    type: 'NotificationUnsubscribe'
};

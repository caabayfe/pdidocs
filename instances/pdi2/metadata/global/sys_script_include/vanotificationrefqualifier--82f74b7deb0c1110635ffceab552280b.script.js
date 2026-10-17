var VANotificationRefQualifier = Class.create();

VANotificationRefQualifier.CHANNEL_TYPE = {CHAT: 'chat', MESSAGING: 'messaging'};
VANotificationRefQualifier.RECORD_CLASS = {CHAT: 'sys_notification_va_content',
										   MESSAGING: 'sys_notification_va_content_messaging'};

/**
 *
 * @param {GlideRecord} vaNotificationContentGr
 * @returns {string} Reference qualifier list
 */
VANotificationRefQualifier.getDeliveryChannelsForContent = function(vaNotificationContentGr) {
	var channelSysIDList = [];

	var notificationContentRecordClassName = vaNotificationContentGr.getRecordClassName();
	var alreadyPickedChannelSysIds = vaNotificationContentGr.getValue('delivery_channels');
	var sysCSChannelGr = new GlideRecord('sys_cs_channel');
	if (notificationContentRecordClassName === VANotificationRefQualifier.RECORD_CLASS.CHAT)
		sysCSChannelGr.addQuery('type', VANotificationRefQualifier.CHANNEL_TYPE.CHAT);
	else if (notificationContentRecordClassName === VANotificationRefQualifier.RECORD_CLASS.MESSAGING)
		sysCSChannelGr.addQuery('type', VANotificationRefQualifier.CHANNEL_TYPE.MESSAGING);

	sysCSChannelGr.addQuery('sys_id', 'NOT IN', alreadyPickedChannelSysIds);

	sysCSChannelGr.query();

	while(sysCSChannelGr.next())
		channelSysIDList.push(sysCSChannelGr.getValue('sys_id'));

	return 'sys_idIN' + channelSysIDList.join(',');
},

/**
 *
 * @param {GlideRecord} vaNotificationContentGr
 * @returns {string} Reference qualifier list for consumer account contexts
 */
VANotificationRefQualifier.getConsumerAccountContexts = function(vaNotificationContentGr) {
	var consumerAccountSysIdList = [];

	var alreadyPickedConsumerAccountContextSysIds = vaNotificationContentGr.getValue('consumer_account_contexts');
	var sysConsumerAccountContextGr = new GlideRecord('sys_cs_consumer_account_context');
	sysConsumerAccountContextGr.addQuery('sys_id', 'NOT IN', alreadyPickedConsumerAccountContextSysIds);

	sysConsumerAccountContextGr.query();

	while(sysConsumerAccountContextGr.next())
		consumerAccountSysIdList.push(sysConsumerAccountContextGr.getValue('sys_id'));

		gs.info('consumerAccountSysIdList: ' + consumerAccountSysIdList);

	return 'sys_idIN' + consumerAccountSysIdList.join(',');
};

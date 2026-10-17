(function executeRule(current, previous /*null when async*/) {

	var recordClassName = current.getRecordClassName();
	var sysCSChannelGr = new GlideRecord('sys_cs_channel');
	
	if (recordClassName === VANotificationRefQualifier.RECORD_CLASS.CHAT)
		sysCSChannelGr.addQuery('type', VANotificationRefQualifier.CHANNEL_TYPE.CHAT);
	else if (recordClassName === VANotificationRefQualifier.RECORD_CLASS.MESSAGING)
		sysCSChannelGr.addQuery('type', VANotificationRefQualifier.CHANNEL_TYPE.MESSAGING);
	
	sysCSChannelGr.query();
	
	var deliveryChannels = [];
	while(sysCSChannelGr.next())
		deliveryChannels.push(sysCSChannelGr.getUniqueValue());

	current.setValue('delivery_channels', deliveryChannels.join(','));
	
	if (!current.isNewRecord())
		current.update();

})(current, previous);

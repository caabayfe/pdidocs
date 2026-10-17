(function executeRule(current, previous /*null when async*/) {

	var onCallCommon = new OnCallCommon();

	var validDeviceType = 'Email';

	if (onCallCommon.isNotifyPluginInstalled())
		validDeviceType = validDeviceType + ',Voice,SMS';

	if (onCallCommon.isSlackPluginInstalled())
		validDeviceType = validDeviceType + ',Slack';

	if (onCallCommon.isMobilePushInstalled())
		validDeviceType = validDeviceType + ',Push';

	var devices = current.getValue('devices');
	var deviceGr = new GlideRecord('cmn_notif_device');
	deviceGr.addQuery('sys_id', 'IN', devices);
	deviceGr.addQuery('type', 'NOT IN', validDeviceType);
	deviceGr.setLimit(1);
	deviceGr.query();
	if (deviceGr.next()) {
		var deviceType = deviceGr.type + '';
		if (deviceType == 'Voice' || deviceType == 'SMS')
			gs.addErrorMessage(gs.getMessage('Voice and SMS devices are supported when Notify is installed'));
		else
			gs.addErrorMessage(gs.getMessage('Devices of type {0} are not supported', deviceType));

		current.setAbortAction(true);
	}

})(current, previous);

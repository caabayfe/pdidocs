(function executeRule(current, previous /*null when async*/) {

	const notificationId = current.getValue('instance');
	if (notificationId) {
		MonitoringNotificationUtil.updateNotificationWithExecution(notificationId, 'sys_email', current.getUniqueValue());
	}

})(current, previous);

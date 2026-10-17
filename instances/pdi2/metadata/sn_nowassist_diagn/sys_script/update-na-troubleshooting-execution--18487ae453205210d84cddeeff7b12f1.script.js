(function executeRule(current, previous /*null when async*/) {
	// Add your code here
	const notificationId = current.getValue('instance');
	if (notificationId) {
		MonitoringNotificationUtil.updateNotificationWithExecution(notificationId, 'sys_notification_execution', current.getUniqueValue());
	}

})(current, previous);

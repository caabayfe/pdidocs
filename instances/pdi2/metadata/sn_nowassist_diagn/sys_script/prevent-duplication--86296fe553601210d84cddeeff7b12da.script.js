(function executeRule(current, previous /*null when async*/) {
	
	if (MonitoringNotificationUtil.isDuplicate('sn_nowassist_diagn_monitor_m2m_notification', current, ['monitor_config', 'notification_config'])) {
		gs.addErrorMessage(gs.getMessage('The provided monitor and notification configs are already associated'));
		current.setAbortAction(true);
	}

})(current, previous);

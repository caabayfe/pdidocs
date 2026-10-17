(function executeRule(current, previous /*null when async*/) {
	if (MonitoringNotificationUtil.isDuplicate('sn_nowassist_diagn_monitor_config', current, ['log', 'trigger_condition'])) {
		gs.addErrorMessage(gs.getMessage('The table is already being monitored for the provided condition'));
		current.setAbortAction(true);
	} 

})(current, previous);

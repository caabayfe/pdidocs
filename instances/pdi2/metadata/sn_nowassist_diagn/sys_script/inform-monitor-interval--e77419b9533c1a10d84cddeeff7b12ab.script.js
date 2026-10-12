(function executeRule(current, previous /*null when async*/) {

	const jobGr = new GlideRecordSecure('sysauto_script');
	if (jobGr.get(MonitoringNotificationUtil.SCHEDULED_JOB)) {
		gs.addInfoMessage(gs.getMessage('This configuration is based on a monitor interval of {0}. <a href="/sysauto_script.do?sys_id={1}">View here</a>', [jobGr.getDisplayValue('run_period'), MonitoringNotificationUtil.SCHEDULED_JOB]));
	}
})(current, previous);

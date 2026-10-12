function transform(input) {
	var state = sn_instance_scan.ScanQueueHealth.getScanQueueStatus();
	var healthMonitorStatus = sn_instance_scan.ScanQueueHealth.isHealthMonitorActive();
	var result = {};

	var ga = new GlideAggregate('sys_execution_tracker');
	ga.addQuery('type', 'sys.instance_scan.queue');
	ga.addAggregate('COUNT');
	ga.addQuery('state', '0');
	ga.query();
	var queueDepth = 0;
	if (ga.next())
		queueDepth = ga.getAggregate('COUNT');

	if (state === 'idle or running') {
		if (queueDepth == 0)
			result.queue_status = gs.getMessage('Idle');
		else
			result.queue_status = gs.getMessage('Running');
	} else
		result.queue_status = gs.getMessage(state);

	result.queue_depth = queueDepth;

	if (state === 'idle or running' || state === 'upgrade paused') {
		result.is_paused = false;
		result.pause_or_resume_button_label = gs.getMessage('Pause');
		result.pause_or_resume_button_tooltip = gs.getMessage('Pause Operation Queue');
	} else {
		result.is_paused = true;
		result.pause_or_resume_button_label = gs.getMessage('Resume');
		result.pause_or_resume_button_tooltip = gs.getMessage('Resume Operation Queue');
	}

	result.healthMonitorStatus = healthMonitorStatus;

	return result;
}

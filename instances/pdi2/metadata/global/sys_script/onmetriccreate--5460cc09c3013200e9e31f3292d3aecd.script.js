(function executeRule(current, previous /*null when async*/) {
	if (!current.element) {
		current.setAbortAction(true);
		var message = gs.getMessage('Invalid metric name: {0}', current.element);
		gs.addErrorMessage(message);
		return;
	}
	
	if (!current.label) 
		current.label = current.element;

	var metricEditUtil = new sn_clotho.MetricEditUtil();

	var hasSchedule = metricEditUtil.checkPolicyHasSchedule(current.retention_policy);
	if (!hasSchedule) {
		var message3 = gs.getMessage('Retention policy must have one or more retention policy schedules.');
		gs.addErrorMessage(message3);
		current.setAbortAction(true);
		return;
	}

	if(current.operation() == 'update')
		return;

	var cleanedName = metricEditUtil.getValidMetricName(current.name, current.element);
	if (cleanedName != current.element) {
		var message1 = gs.getMessage('Metric element name ({0}) has been changed to ({1})', [current.element, cleanedName]);
		gs.addInfoMessage(message1);
		current.element = cleanedName;
	}
	
	var conflictExists = metricEditUtil.conflictMetricExists(current.name, current.element, current.retention_policy, current.auto_promote);
	if (conflictExists) {
		var message2 = gs.getMessage('Metric {0} already exists in this table or in a table extends from it', current.element);
		gs.addErrorMessage(message2);
		current.setAbortAction(true);
		return;
	}
})(current, previous);

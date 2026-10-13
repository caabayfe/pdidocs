(function executeRule(current, previous /*null when async*/) {
	var triggerRecord = new GlideRecord('sys_metric_trigger_model');
	triggerRecord.addQuery('model', current.sys_id);
	triggerRecord.addQuery('metric', previous.metric.sys_id);
	triggerRecord.addQuery('metric_table', previous.metric_table.sys_id);
	triggerRecord.query();
	while (triggerRecord.next()){
		triggerRecord.setValue('metric', current.metric.sys_id);
		triggerRecord.setValue('metric_table', current.metric_table.sys_id);
		triggerRecord.update();
	}

})(current, previous);

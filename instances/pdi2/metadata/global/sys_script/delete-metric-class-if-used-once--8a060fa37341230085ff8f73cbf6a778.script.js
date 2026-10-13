(function executeRule(current, previous /*null when async*/) {
	var metricClassId = current.setting_reference_value;
	var gr = GlideRecord('sa_metric_config_rule_setting');
	gr.addQuery('setting_reference_value', metricClassId);
	gr.query();

	// If Metric Class is only used by this one Metric Config Rule Setting, delete the Metric Class
	if (gr.getRowCount() == 1) {
		gr = GlideRecord('sa_metric_class');
		gr.addQuery('sys_id', metricClassId);
		gr.query();
		gr.next();
		gr.deleteRecord();
	}

})(current, previous);

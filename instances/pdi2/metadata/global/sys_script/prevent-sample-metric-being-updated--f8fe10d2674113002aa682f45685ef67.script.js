(function executeRule(current, previous /*null when async*/) {
	var sample_metric_id = current.metric_type.sample_metric + '';
	var metric_id = current.getUniqueValue();
	if (sample_metric_id && sample_metric_id === metric_id) {
		gs.addInfoMessage(gs.getMessage("This Question is selected as the Sample Metric at the Survey level. To make changes, please remove this Question from Sample Metric field and add it back after the changes are done."));
	}
})(current, previous);

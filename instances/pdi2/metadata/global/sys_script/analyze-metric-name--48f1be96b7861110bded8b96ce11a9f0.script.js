(function executeRule(current, previous /*null when async*/) {
	var metricNameAnalysisUtil = new MetricNameAnalysisUtil();
    var res = metricNameAnalysisUtil.analyzeMetricName(current.metric_type_tiny_name);
	if(GlideStringUtil.nil(res)){
		var message = gs.getMessage('Failed to analyze tiny metric name.');
		gs.addErrorMessage(message);
		return;
	}
	current.metric_name_analysis_result = res;

})(current, previous);

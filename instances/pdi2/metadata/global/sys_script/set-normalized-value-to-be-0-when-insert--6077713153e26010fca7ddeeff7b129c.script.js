(function executeRule(current, previous /*null when async*/ ) {

    var metricResults = new GlideRecord('asmt_metric_result');
    metricResults.addQuery('instance', current.instance + '');
    metricResults.addQuery('metric', current.metric + '');
    metricResults.addQuery('normalized_value', '>', 0);
    metricResults.addQuery('sys_id', '!=', current.getUniqueValue());
    metricResults.query();
	
	// Only keep the maximum normalized value
    if (metricResults.next()) {
        if (metricResults.normalized_value <= current.normalized_value) {
            metricResults.normalized_value = 0;
            metricResults.weighted_value = 0;
            metricResults.update();
        } else {
            current.normalized_value = 0;
            current.weighted_value = 0;
        }
    }
})(current, previous);

(function executeRule(current, previous /*null when async*/) {

	var metricAnomalyScoreGr = new GlideRecord("sa_metric_anomaly_score");
	metricAnomalyScoreGr.addQuery("cmdb_ci", current.cmdb_ci);
	metricAnomalyScoreGr.addQuery("resource_id", current.resource_id);
	metricAnomalyScoreGr.addQuery("metric_type_id", current.metric_type_id);
	metricAnomalyScoreGr.deleteMultiple();

})(current, previous);

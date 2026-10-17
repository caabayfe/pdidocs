var metricNameAnalysisUtil = new MetricNameAnalysisUtil();
var gr = new GlideRecord('sa_metric_type');
gr.query();
gr.setWorkflow(false);
while (gr.next()) {
    var res = metricNameAnalysisUtil.analyzeMetricName(gr.getValue('metric_type_tiny_name'));
    gr.metric_name_analysis_result = res;
    gr.update();
}

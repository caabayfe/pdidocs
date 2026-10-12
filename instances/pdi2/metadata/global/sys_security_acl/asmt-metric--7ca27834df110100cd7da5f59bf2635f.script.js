var sample_metric_id = current.metric_type.sample_metric + '';
var metric_id = current.getUniqueValue();
answer = !(sample_metric_id && sample_metric_id === metric_id);

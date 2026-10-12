var aggregator = new OutboundUsageMetricsAggregator();
var sums = aggregator.getTransactionCountForLastMonth('sys_hub_step_instance', true);
answer = sums;

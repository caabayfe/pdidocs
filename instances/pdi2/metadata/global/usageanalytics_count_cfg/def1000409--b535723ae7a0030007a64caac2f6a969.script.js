var aggregator = new OutboundUsageMetricsAggregator();
var sum = aggregator.getTransactionCountForLast30Days('sys_hub_step_instance', true);
answer = sum;

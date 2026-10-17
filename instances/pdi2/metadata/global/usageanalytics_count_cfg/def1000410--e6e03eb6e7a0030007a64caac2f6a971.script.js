var aggregator = new OutboundUsageMetricsAggregator();
var sums = aggregator.getTransactionCountByMonth('sys_hub_step_instance', true);
var totalSum = 0;
while (sums.next()) {  
  totalSum = totalSum + parseInt(sums.getAggregate('SUM', 'agg_value'), 10);
}
answer = totalSum;

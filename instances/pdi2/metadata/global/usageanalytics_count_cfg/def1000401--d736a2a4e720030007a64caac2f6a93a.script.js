var aggregator = new OutboundUsageMetricsAggregator();
var sums = aggregator.getTransactionCountByMonth('sys_hub_step_instance', true);
var maxCount = 0;
while (sums.next()) {
  var currentCount = parseInt(sums.getAggregate('SUM', 'agg_value'));
  if(currentCount > maxCount)
    maxCount = currentCount;
}
answer = maxCount;

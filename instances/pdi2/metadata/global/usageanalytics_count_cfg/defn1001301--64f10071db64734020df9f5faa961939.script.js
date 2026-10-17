var aggregator = new IHUsageMetricsAggregator();
var sums = aggregator.getTransactionCountByMonth(false);
var totalSum = 0;
while (sums.next()) {  
  totalSum = totalSum + parseInt(sums.getAggregate('SUM', 'use_count'), 10);
}
answer = totalSum/12;

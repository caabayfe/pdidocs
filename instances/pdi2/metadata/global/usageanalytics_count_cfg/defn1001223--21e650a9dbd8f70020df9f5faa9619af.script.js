var aggregator = new IHUsageMetricsAggregator();
var sums = aggregator.getTransactionCountByMonth(true);
var maxCount = 0;
while (sums.next()) {  
  var currentCount = parseInt(sums.getAggregate('SUM', 'use_count'));
  if(currentCount > maxCount) 
    maxCount = currentCount;
}
answer = maxCount;

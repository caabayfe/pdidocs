updateDataCollectionStatus(current.indicator);

function updateDataCollectionStatus(indicator) {
   SNC.PAIndicatorAggregatedMetrics.refreshDataCollection(indicator);
}

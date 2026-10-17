if (current.operation() == "delete" || current.reportable == false)
	SNC.UsageAnalyticsScriptUtils.deleteCountGauge(current.name, current.description);
else 
	SNC.UsageAnalyticsScriptUtils.insertOrUpdateCountGauge(current.name, current.description);

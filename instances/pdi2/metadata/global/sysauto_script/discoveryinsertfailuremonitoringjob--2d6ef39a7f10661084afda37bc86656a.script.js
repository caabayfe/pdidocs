var windowTime = (new GlideDateTime(current.run_period).getNumericValue() / 1000) + 60;
	DiscoverySysTriggerInsertFailureMonitor.findAndHandleInsertFailures(windowTime);

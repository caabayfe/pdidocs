if (JSUtil.toBoolean(gs.getProperty('glide.discovery.perf.metrics.rollup_by_status', 'false')))
	AggregateDiscoveryPerfMetrics.rollup(current);

if (JSUtil.toBoolean(gs.getProperty('glide.discovery.perf.metrics.rollup_by_target', 'false')))
	AggregateDiscoveryPerfMetrics.rollup(current, true);

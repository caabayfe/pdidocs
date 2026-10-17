var source = current.source;
// mark all metrics mapping entries of this source as expired
new MetricIntelligenceGlobalUtils().expireMetricMapBySource(source, true);

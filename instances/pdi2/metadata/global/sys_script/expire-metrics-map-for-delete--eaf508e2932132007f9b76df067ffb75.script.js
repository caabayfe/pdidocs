(function executeRule(current, previous /*null when async*/) {

	//This bs rule is only for delete, since delete can't use async rule, there is another async rule for update and insert

	var eventRuleSource = current.event_class;
	// mark all metrics mapping entries of this source as expired
	new MetricIntelligenceGlobalUtils().expireMetricMapBySource(eventRuleSource, false);
	
})(current, previous);

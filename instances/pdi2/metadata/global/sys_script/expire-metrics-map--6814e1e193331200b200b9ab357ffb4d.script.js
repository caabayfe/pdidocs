(function executeRule(current, previous /*null when async*/) {

	//This bs rule is for insert and update, since delete can't use async rule, there is another sync rule for delete
	var eventRuleSource = current.event_class;
	// mark all metrics mapping entries of this source as expired
	new MetricIntelligenceGlobalUtils().expireMetricMapBySource(eventRuleSource, false);
	
})(current, previous);

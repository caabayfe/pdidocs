(function executeRule(current, previous /*null when async*/) {
	new TriggerRule().abortActionIfDefaultTriggerRuleExists(current);
})(current, previous);

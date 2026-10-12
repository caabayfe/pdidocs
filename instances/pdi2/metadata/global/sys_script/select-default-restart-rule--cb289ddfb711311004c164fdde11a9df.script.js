(function executeRule(current, previous /*null when async*/) {
	var restartRule = current.restart_rule;
	
	if (!restartRule) {
		current.restart_rule.setValue("RUN_ONLY_ONCE");
	}
})(current, previous);

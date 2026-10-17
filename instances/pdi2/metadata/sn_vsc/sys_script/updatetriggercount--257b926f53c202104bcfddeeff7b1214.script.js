(function executeRule(current, previous /*null when async*/) {
	var util = new SCSecurityPolicyUtil();
	util.incrementTriggeredStats(current.policy, current.start_time);
})(current, previous);

(function executeRule(current, previous /*null when async*/) {

	new CMDBWsDMPolicyManager().populateTaskExecutionCounts(current);

})(current, previous);

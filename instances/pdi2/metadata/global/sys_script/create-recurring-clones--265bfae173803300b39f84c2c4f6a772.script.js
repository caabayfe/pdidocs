(function executeRule(current, previous /*null when async*/) {
	
	current.recurring = true;
	InstanceCloneUtil.generateRecurringClones(current);
	
})(current, previous);

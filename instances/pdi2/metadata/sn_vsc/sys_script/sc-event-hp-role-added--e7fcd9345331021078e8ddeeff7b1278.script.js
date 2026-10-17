(function executeRule(current, previous /*null when async*/) {
	var callScriptInclude = new SCEventUtil();
	callScriptInclude.createHpRoleAddedEvent(current);
})(current, previous);

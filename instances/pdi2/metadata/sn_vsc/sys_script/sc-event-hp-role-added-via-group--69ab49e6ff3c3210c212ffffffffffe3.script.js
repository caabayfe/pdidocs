(function executeRule(current, previous /*null when async*/) {
	var callScriptInclude = new SCEventUtil();
	callScriptInclude.createHpRoleAddedViaGroupEvent(current);
})(current, previous);

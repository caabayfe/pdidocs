(function executeRule(current, previous /*null when async*/) {
	var computerSysId = current.getValue("computer");
	current.setValue("cmdb_ci", computerSysId);
})(current, previous);

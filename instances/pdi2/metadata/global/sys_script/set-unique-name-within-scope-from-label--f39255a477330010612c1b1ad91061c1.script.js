(function executeRule(current, previous) {
	if (current.operation() == "insert")
		new PDNameGenerator().generateNameFromLabel(["sys_scope"]);
})(current, previous);

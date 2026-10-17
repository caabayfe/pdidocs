(function executeRule(current, previous) {
	if (current.operation() == "insert")
		new PDNameGenerator().generateNameFromLabel();
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	if (current.inputs.variable_set == "") {
		current.inputs.variable_set = SCATFUtil.getLastTableVarSetOpened(current);
	}
})(current, previous);

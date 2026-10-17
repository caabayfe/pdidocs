(function executeRule(current, previous /*null when async*/) {
	current.inputs.table = sn_atf.AutomatedTestingFramework.getLastUsedTableNameInTestBasedOnStep(current);
})(current, previous);

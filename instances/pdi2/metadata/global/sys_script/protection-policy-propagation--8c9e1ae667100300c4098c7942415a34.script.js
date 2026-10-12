(function executeRule(current, previous /*null when async*/) {
	// Propogate to Step Instances
	propagateSysPolicy("sys_hub_step_instance", "action");
	
	// Propogate to Inputs and Outputs
	propagateSysPolicy("sys_hub_action_input", "model");
	propagateSysPolicy("sys_hub_action_output", "model");

	function propagateSysPolicy(childTable, foreignKey) {
		var child = new GlideRecord(childTable);
		child.addQuery(foreignKey, current.getUniqueValue());
		child.query();
		while (child.next()) {
			child.sys_policy = current.sys_policy;
			child.update();
		}
	}
})(current, previous);

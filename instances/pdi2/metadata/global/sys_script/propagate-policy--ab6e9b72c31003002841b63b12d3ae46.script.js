(function executeRule(current, previous /*null when async*/) {
	// Propagate to Flow Component
	propagateSysPolicy("sys_hub_flow_component", "flow");
	
	// Propagate to Inputs and Outputs
	propagateSysPolicy("sys_hub_flow_input", "model");
	propagateSysPolicy("sys_hub_flow_output", "model");

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

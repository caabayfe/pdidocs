(function refineQuery(current, parent) {
	// Add your code here, such as current.addQuery(field, value);
	current.addQuery("action_configuration", parent.getUniqueValue());
	var assignmentGr = current.addJoinQuery("sys_declarative_action_assignment", "action_assignment", "sys_id");
	assignmentGr.addCondition("model", "c3547169534723003eddddeeff7b126c");
})(current, parent);

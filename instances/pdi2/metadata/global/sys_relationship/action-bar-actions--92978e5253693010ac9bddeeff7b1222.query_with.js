(function refineQuery(current, parent) {
	// Add your code here, such as current.addQuery(field, value);
	current.addQuery("action_configuration", parent.getUniqueValue());
	var assignmentGr = current.addJoinQuery("sys_declarative_action_assignment", "action_assignment", "sys_id");
	assignmentGr.addCondition("model", "360935e9534723003eddddeeff7b127d");
	assignmentGr.addCondition("form_position", "action_bar");
})(current, parent);

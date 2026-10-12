(function executeRule(current, previous /*null when async*/) {

	// Any attempt to update to an empty value will update to the previously saved value for non english languages
	var updated_name = current.parent_descriptor.getDisplayValue() + '::' + current.child_descriptor.getDisplayValue();
	current.name = updated_name;
	current.sys_name = updated_name;
	current.setWorkflow(false);
	current.update();
	current.setWorkflow(true);

})(current, previous);

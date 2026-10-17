(function executeRule(current, previous /*null when async*/) {
	if (current.getTableName() == 'ml_capability_definition_classification')
		current.addQuery("sys_class_name","ml_capability_definition_classification");
})(current, previous);

getAvailablePackageDependencies();

function getAvailablePackageDependencies() {
	var queryCondition = lookup.addQuery('sys_class_name', current.sys_class_name);
	queryCondition.addOrCondition('sys_class_name', 'sys_plugins');
}

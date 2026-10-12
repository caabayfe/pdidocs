(function executeRule(current, previous /*null when async*/) {
	if (current.sys_class_name == 'sys_app')
		current.licensable = true;
 
	current.trackable = true;
})(current, previous);

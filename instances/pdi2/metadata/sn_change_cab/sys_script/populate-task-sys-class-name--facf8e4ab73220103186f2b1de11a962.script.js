(function executeRule(current, previous /*null when async*/) {

	var taskGr = current.task.getRefRecord();
	current.setValue("task_sys_class_name", taskGr.getValue("sys_class_name"));

})(current, previous);

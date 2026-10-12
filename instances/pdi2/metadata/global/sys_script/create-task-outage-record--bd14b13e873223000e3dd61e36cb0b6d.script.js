(function executeRule(current, previous /*null when async*/) {

	var taskGr = current.task_number.getRefRecord();
	new CreateOutageUtil().createTaskOutageRecord(taskGr, current);

})(current, previous);

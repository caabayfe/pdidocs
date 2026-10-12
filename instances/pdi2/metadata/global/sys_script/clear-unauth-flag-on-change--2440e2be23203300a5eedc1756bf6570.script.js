(function executeRule(current, previous /*null when async*/) {
	var chgGr = current.task_number.getRefRecord();
	if (chgGr && chgGr.getValue('unauthorized')) {
		chgGr.setValue('unauthorized', false);
		chgGr.update();
	}

})(current, previous);

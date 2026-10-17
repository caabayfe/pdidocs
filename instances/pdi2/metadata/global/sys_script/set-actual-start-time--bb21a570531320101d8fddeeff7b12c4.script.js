(function executeRule(current, previous /*null when async*/) {
	if (current.operation() == 'insert' || (current.operation() == 'update' && previous.state == -5)) {
		//run BR only when new sc_task is inserted in open/WIP state, or when sc_task is updated by moving state from pending to open/ WIP
		current.work_start = nowDateTime();
	}
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	//Clear on hold flag and reason when task is cancelled / closed
	new ChangeTask(current).clearOnHold();
})(current, previous);

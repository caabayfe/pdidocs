(function executeRule(current, previous /*null when async*/) {
	new ChangeManagementWorker(current).fireEvent();
})(current, previous);

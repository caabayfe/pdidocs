(function executeRule(current, previous /*null when async*/) {

	var chgScript = new ChangeRequest(current);
	chgScript.cancelAssociatedTasks();

})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	//Place the new change task on hold as the parent change request is on hold.
	var cTask = new ChangeTask(current);
	cTask.setOnHold(true);
	cTask.setOnHoldReason(current.change_request.on_hold_reason);
})(current, previous);

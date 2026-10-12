(function executeRule(current, previous /*null when async*/) {
	new ChangeRequest(current.change_request.getRefRecord()).addToOnHoldTaskList(current.getUniqueValue());
})(current, previous);

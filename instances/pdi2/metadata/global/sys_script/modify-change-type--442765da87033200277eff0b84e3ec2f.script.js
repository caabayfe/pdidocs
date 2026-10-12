(function executeRule(current, previous /*null when async*/) {
	
	var previousType = previous.getValue("type");
	var changeRequest = new ChangeRequest(current);
	changeRequest.modifyType(previousType);
	
})(current, previous);

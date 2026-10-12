(function executeRule(current, previous /*null when async*/) {
	var changeRequest = new ChangeRequest(current);
	var prevChangeRequest = new ChangeRequest(previous);
	
	// Set the transaction to the previous change state
	prevChangeRequest.setTransactionChangeState();
	changeRequest.setGlobalFromNew(changeRequest.isInitialState() || prevChangeRequest.isInitialState());
})(current, previous);

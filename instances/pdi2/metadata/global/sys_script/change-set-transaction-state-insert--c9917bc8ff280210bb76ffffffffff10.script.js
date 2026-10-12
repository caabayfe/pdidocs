(function executeRule(current, previous /*null when async*/) {
	var changeRequest = new ChangeRequest(current);
	changeRequest.setTransactionChangeState(changeRequest.getInitialState());
	changeRequest.setGlobalFromNew(true);
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	// we just closed this requested item. Have to cancel its approvals
	var request = new SNC.Request(current);
	if (request)
		request.cancelRelatedRecords();
})(current, previous);

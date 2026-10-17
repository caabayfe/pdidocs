(function scriptedWebServiceOperation(request, response) {
	if (!gs.hasRole("mid_server")) {
		response.error = "The mid_server role is required.";
		return;
	}

	var midSysId = request.midSysId;
	var issueList = JSON.parse(request.issues);

	if (issueList) {
		issueList.forEach(function (issueListItem) {
			var operation = issueListItem.operation;
			var issue = issueListItem.issue;
			var source = issue.source;
			var message = issue.message;
			doIssueOperation(midSysId, operation, source, message);
		});
	} else {
		// for backwards compatiblity with older MIDs (pre-Washington D.C.)
		var operation = request.operation;
		var source = request.source;
		var message = request.message;
		doIssueOperation(midSysId, operation, source, message);
	}
	
})(request, response);

function doIssueOperation(midSysId, operation, source, message) {
	switch (operation) {
		case "log":
			MIDServerUtil.createOrUpdateIssue(midSysId, source, message);
			break;
		case "resolve":
			MIDServerUtil.resolveExistingIssues(midSysId, source, message);
			break;
		case "unique_log": 
			MIDServerUtil.createOrUpdateUniqueIssue(midSysId, source, message);
			break;
		default:
			response.error = "Invalid operation";
			break;
	}
}

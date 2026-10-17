function transform(input) {
    var coAuthorList = input.coAuthors;
    var sysId = input.sysId;

	var postIncidentReportManager = new PIRManager();
	var permissions = postIncidentReportManager.getPermissionsForUser(sysId);
	if (!permissions.canEditContributors) {
		return new Error("User doesn't have permissions to add or edit co-authors");
	}

    var output = {
        "message": "",
        "status": 200
    };
    if (sysId == null || coAuthorList == null)
        return;
    postIncidentReportManager.saveCoAuthorsForPIR(sysId, coAuthorList, output);
    return output;
}

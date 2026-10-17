function transform(input) {
    var postIncidentReportManager = new PIRManager();
	var permissions = postIncidentReportManager.getPermissionsForUser(input.sys_id);
	if (!permissions.canPublish) {
		return new Error("User doesn't have permission to publish or unpublish the PIR.");
	}
    var res = postIncidentReportManager.markPublish(input.sys_id, input.state);
    if (res.status == 200) {
        return {
            status: res.status,
			message: res.message
        };
    } else {
        return new Error(res.result.message);
    }
}

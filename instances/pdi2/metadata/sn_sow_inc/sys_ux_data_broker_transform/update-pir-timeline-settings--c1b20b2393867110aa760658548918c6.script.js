function transform(input) {
    var postIncidentReportManager = new PIRManager();
	var permissions = postIncidentReportManager.getPermissionsForUser(input.sys_id);
	if (!permissions.canEditTimeline) {
		return new Error("User doesn't have permissions to update timeline settings.");
	}
    var res = postIncidentReportManager.updateTimelineSettings(input.sys_id, input.settings);
    if (res.status == 200) {
        return {
            status: res.status,
			message: res.message
        };
    } else {
        return new Error(res.result.message);
    }
}

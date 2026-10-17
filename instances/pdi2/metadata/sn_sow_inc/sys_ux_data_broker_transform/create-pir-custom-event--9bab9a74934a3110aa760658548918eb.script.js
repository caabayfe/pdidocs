function transform(input) {
    var postIncidentReportManager = new PIRManager();
    var permissions = postIncidentReportManager.getPermissionsForUser(input.sys_id);
    if (!permissions.canAddTimelineEvent) {
        return new Error("User doesn't have permissions to add the custom event.");
    }
    var res = postIncidentReportManager.insertOrUpdateEvent(input.sys_id, input.event);
    if (res.status == 200) {
        return {
            status: res.status,
            message: res.message
        };
    } else {
        return new Error(res.message);
    }
}

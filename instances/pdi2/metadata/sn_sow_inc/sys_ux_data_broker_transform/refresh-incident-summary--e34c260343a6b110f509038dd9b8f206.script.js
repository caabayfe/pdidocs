function transform(input) {
    var sysId = input.sysId;
    var summary = input.summary;

    var postIncidentReportManager = new PIRManager();
    var permissions = postIncidentReportManager.getPermissionsForUser(input.incidentSysId);
    if (!permissions.canEditSummary) {
        return new Error("User doesn't have permissions to edit incident summary.");
    }

    var output = {
        "message": "",
        "status": 200
    };

    if (sysId == null || summary == null)
        return;

    postIncidentReportManager.updatePIRSummary(sysId, summary, output);
    return output;
}

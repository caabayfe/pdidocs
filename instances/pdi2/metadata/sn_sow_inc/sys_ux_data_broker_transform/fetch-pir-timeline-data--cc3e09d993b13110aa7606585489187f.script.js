function transform(input) {
    var postIncidentReportManager = new PIRManager();
    var result = [];
    try {
        result = postIncidentReportManager.retrieveTimelineData(input.sys_id);
        return result;
    } catch (e) {
        gs.error('Failed to fetch PIR timeline data ' + e);
        return new Error("Failed to fetch PIR timeline data");
    }
}

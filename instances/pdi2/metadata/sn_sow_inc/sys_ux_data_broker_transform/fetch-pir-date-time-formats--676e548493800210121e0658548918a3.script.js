function transform(input) {
    var postIncidentReportManager = new PIRManager();
    var result = [];
    try {
        result = postIncidentReportManager.getDateTimeFormats();
        return result;
    } catch (e) {
        gs.error('Failed to fetch PIR date time formats ' + e);
        return new Error("Failed to fetch PIR date time formats");
    }
}

(function executeRule(current, previous /*null when async*/ ) {

    // Delete related stats records
    var reportStats = new SNC.ReportStats();
    reportStats.deleteStats(current.getUniqueValue());

})(current, previous);

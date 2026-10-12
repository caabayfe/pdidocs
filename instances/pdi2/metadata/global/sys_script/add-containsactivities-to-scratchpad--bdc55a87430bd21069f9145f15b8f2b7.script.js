(function executeRule(current, previous /*null when async*/ ) {
    var processTypeActivityMapping = PDUtils.getPlaybookTypeActivities(current.getUniqueValue());
    g_scratchpad.containsActivities = processTypeActivityMapping.hasNext();
})(current, previous);

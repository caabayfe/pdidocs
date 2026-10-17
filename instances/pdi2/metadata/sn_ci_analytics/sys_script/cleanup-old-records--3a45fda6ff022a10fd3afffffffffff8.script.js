(function executeRule(current, previous /*null when async*/ ) {
    var config = new CAConfig();
    var maxSearchSupported = config.getMaximumSearchesSupported() - 1;
    new CAPARCleanUp().performCleanUp('sn_ci_analytics_search_breakdown', 'event_type', current.getValue('event_type'), maxSearchSupported);
})(current, previous);

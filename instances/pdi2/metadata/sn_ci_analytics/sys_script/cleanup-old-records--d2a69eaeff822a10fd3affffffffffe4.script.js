(function executeRule(current, previous /*null when async*/ ) {
    var config = new CAConfig();
    var maxEventPropsSupported = config.getMaximumEventPropSupported() - 1;
    new CAPARCleanUp().performCleanUp('sn_ci_analytics_event_breakdown', 'event_prop', current.getValue('event_prop'), maxEventPropsSupported);
})(current, previous);

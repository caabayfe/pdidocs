var logger = CIAnalyticsLogger.getLogger('CI Custom Event Breakdown Cleanup Job');
logger.info('Started');
var config = new CAConfig();
var maxEventPropsSupported = config.getMaximumEventPropSupported();
new CAPARCleanUp().performCleanUp('sn_ci_analytics_event_breakdown', 'event_prop', '', maxEventPropsSupported);
logger.info('Completed');

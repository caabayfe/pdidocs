var logger = CIAnalyticsLogger.getLogger('CI Search Breakdown Cleanup Job');
var config = new CAConfig();
logger.info('Started');
var maxSearchSupported = config.getMaximumSearchesSupported();
new CAPARCleanUp().performCleanUp('sn_ci_analytics_search_breakdown', 'event_type', '', maxSearchSupported);
logger.info('Completed');

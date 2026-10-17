var logger = CIAnalyticsLogger.getLogger('CI ETL Job');
logger.info('Started');
new CAProcessor().process();
logger.info('Completed');

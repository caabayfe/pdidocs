var logger = CIAnalyticsLogger.getLogger('CI PAR Job');
logger.info('Started');
new CAPARProcessor().process();
logger.info('Completed');

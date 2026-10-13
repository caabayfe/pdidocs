var logger = CIAnalyticsLogger.getLogger('CI Appsee Job');
logger.info('Started');
new CAAppseeProcessor().process();
logger.info('Completed');

answer = true;
var config = new CAConfig();
if (config.isAnalyticsProcessingEnabled() != 'true') {
    CIAnalyticsLogger.getLogger('CI ETL Job').info('Unable to start CI ETL schedule job');
    answer = false;
}

answer = true;
var config = new CAConfig();
if (config.isParJobEnabled() != 'true') {
    CIAnalyticsLogger.getLogger('CI PAR Job').info('Unable to start CI - search breakdown cleanup  schedule job');
    answer = false;
}

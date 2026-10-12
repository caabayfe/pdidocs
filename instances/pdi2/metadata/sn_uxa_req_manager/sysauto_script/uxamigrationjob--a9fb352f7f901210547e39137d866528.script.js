
const logger = QueryServiceApiLogger.getLogger('UXAAppScreenMigration');
logger.info('STARTING ==== UX Analytics App Screen Migration  job for app screens');

try {

    // Core validation (on-premises, maintenance mode)
    if (sn_app_analytics.SNAnalytics.isEnabled()) {
        var uxaMigration = new UXAMigration();
        const retries = uxaMigration.getRetryCount();
        const appseeAPIServerHost = sn_app_analytics.SNAnalytics.getAPIServerHost();
		var isValidHost = appseeAPIServerHost && typeof appseeAPIServerHost === 'string';
        if (!isValidHost || uxaMigration.isMigrationComplete() == 'complete' || new UXAUtils().isLegacyDashboardEnabled() || retries.current >= retries.max) {
            // disable the job and exit
            var current = new GlideRecord('sysauto_script');
            current.get('a9fb352f7f901210547e39137d866528');
            current.setValue('active', false);
            current.update();
            logger.info("UX Analytics Migration job - DISABLED, if this is running all the time, there is something wrong");
        } else {
            uxaMigration.migrate();
            logger.info("END ==== UX Analytics Migration job ended");
        }
    } else {
        gs.debug('UXAMigrationJob: Skipping UXAMigrationJob - Analytics disabled or on-premises/selfhosted instance detected');
    }
} catch (ex) {
    logger.error('Error while running UX Analytics Migration Job - ' + JSON.stringify(ex));
}

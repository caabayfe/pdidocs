this.self_sys_id = 'a8f76abb7fb01210e5198b2cac86657f';
this.migration_complete_property = 'com.glide.appsee.uxaapp_migration_complete';
gs.info("STARTING ==== UX Analytics App Migration  job for apps");
var appMigration = new UXAAppMigration();
var retries = appMigration.getRetryCount();

var shouldNotMigrate = false;
try {
    var legacyDashboardEnabled = gs.getProperty('glide.uxa.legacy_dashboard.enabled') == 'true';
    var disabledMigrationJob = gs.getProperty('com.glide.appsee.uxa_disable_app_migration_job') == 'true';
    var max_retry_exceeded = Boolean(retries.current >= retries.max);
    var appseeAPIServerHost = sn_app_analytics.SNAnalytics.getAPIServerHost();

    gs.info("glide.uxa.legacy_dashboard.enabled :" + legacyDashboardEnabled);
    gs.info("com.glide.appsee.uxa_disable_app_migration_job:" + disabledMigrationJob);
    gs.info("Max no of retries over: " + max_retry_exceeded);
    gs.info("API Server Host: " + appseeAPIServerHost);

    var isValidHost = appseeAPIServerHost && typeof appseeAPIServerHost === 'string';
    shouldNotMigrate = !isValidHost || legacyDashboardEnabled || disabledMigrationJob || max_retry_exceeded;

    gs.info("shouldNotMigrate: " + shouldNotMigrate);

    if (!shouldNotMigrate) {
        // Check if all the appsee apps are present in instance table.
        var isMigrationComplete = appMigration.isMigrationComplete();
        gs.info("isMigrationComplete: " + isMigrationComplete);
        if (isMigrationComplete) {
            appMigration.insertSysProperty(this.migration_complete_property, true);
        } else {
            appMigration.migrateApps();
            gs.info("UXAAppMigrationJob :  Migration Apps completed.");
        }
    }

    //disable the job and exit
    var current = new GlideRecord('sysauto_script');
    current.get(this.self_sys_id);
    current.setValue('active', false);
    current.update();
    gs.info("UX Analytics App Migration job - DISABLED");
    gs.info("END ==== UX Analytics App Migration job ended for apps");

} catch (e) {
    gs.error("UXAAppMigrationJob : Exception occurred in the job details:" + e);
    appMigration.updateRetryCount();
}

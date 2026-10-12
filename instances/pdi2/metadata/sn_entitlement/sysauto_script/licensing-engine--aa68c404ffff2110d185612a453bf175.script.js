run();

function run() {
    const isThisInstanceSelfHosted = gs.getProperty("glide.installation.self_hosted", "false") == "true";
    const hasSelfHostedInstanceSupport = sn_lef.SelfHostedInstanceAPIProcessor ? true : false;
    if (isThisInstanceSelfHosted === true && hasSelfHostedInstanceSupport === false) {
        gs.info("System is self hosted, Licensing Engine exiting without running");
        return;
    }

    const internalInstanceOverride = gs.getProperty('glide.ua.downloader.central_instance.servicenow_internal_instance_override', 'false') === 'true';
    if (!internalInstanceOverride && new sn_entitlement.UAInstanceStateDAO().isServiceNowInstance()) {
        gs.info("System is a service-now.com instance, Licensing Engine exiting without running");
        return;
    }

    this.logger = new LoggingUtil();
    const LICENSING_ENGINE = "Licensing Engine";

    const triggerGr = new GlideRecord("sys_trigger");
    triggerGr.addQuery("document_key", 'aa68c404ffff2110d185612a453bf175'); // the sys_id of this scheduled job
    triggerGr.addQuery("state", ">", 0); // state:1=running, state:2=queued
    triggerGr.query();
    if (triggerGr.getRowCount() > 1) { // there should be only 1 in execution, this one.
        this.logger.logInfo(LICENSING_ENGINE, LICENSING_ENGINE, `Licensing Engine already running, exiting`);
        return;
    }

    const skipRoleAnalyzerAndSyncSteps = gs.getProperty("glide.licensing.license_engine.skip_role_analyzer_and_sync", "false") === "true";

    const SUBSCRIPTION_ENTITLEMENT_DOWNLOAD = "Subscription Entitlement Download";
    const DOWNLOAD_CODE = 11001;

    const DISCOVER_CUSTOM_LICENSABLE_ROLES = "Discover Custom Licensable Roles";
    const ROLE_ANALYZER_CODE = 11004;

    const UPLOAD_AND_DOWNLOAD_ROLES = "Upload And Download Roles";
    const ROLE_SYNC_CODE = 11002;

    const SYNC_USER_HAS_SUBSCRIPTION = "Sync user_has_subscription entries";
    const SYNC_USER_HAS_SUBSCRIPTION_CODE = 11005;

    const SUBSCRIPTION_DETAILS = "Subscription Details";
    const SUBSCRIPTION_DETAILS_CODE = 11003;

    const CREATOR_USERS_SYNC = "Creator Users Upload Sync";
    const CREATOR_USERS_SYNC_CODE = 11006;

    const ENTITLEMENT_DISPLAY_DETAILS_DOWNLOAD = "Entitlement Display Details Download";

    const CORRECT_PROPERTIES_ISSUES = "Correct sys_properties issues";
    const CORRECT_PROPERTIES_ISSUES_CODE = 11007;

    const APP_ENGINE_V1_ISSUES = "App Engine V1 issues";
    const APP_ENGINE_V1_ISSUES_CODE = 11008;

    // Correct sys_properties issues
    try {
        new global.LicensingEnginePropertiesFixer().fixInvalidProperties();
    } catch (e) {
        this.logger.logError(LICENSING_ENGINE, CORRECT_PROPERTIES_ISSUES, `Execution of licensing engine : Correcting properties failed : ${e}`, CORRECT_PROPERTIES_ISSUES_CODE, LICENSING_ENGINE + "." + CORRECT_PROPERTIES_ISSUES);
    }

    // used for 'Licensing Engine operations finished' log
    const start = Date.now();

    if (isThisInstanceSelfHosted == false) {
        //Subscription Entitlement Download
        try {
            new sn_entitlement.EntitlementDownloader().downloadEntitlements();
        } catch (e) {
            this.logger.logError(LICENSING_ENGINE, SUBSCRIPTION_ENTITLEMENT_DOWNLOAD, `Execution of licensing engine : Subscription Entitlement Download failed : ${e}`, DOWNLOAD_CODE, LICENSING_ENGINE + "." + SUBSCRIPTION_ENTITLEMENT_DOWNLOAD);
        }
        this.logger.logInfo(LICENSING_ENGINE, SUBSCRIPTION_ENTITLEMENT_DOWNLOAD, `Licensing Engine Download finished, elapsed time(ms) : ${Date.now() - start}`);


        //Subscription Entitlements Display Details Download
        const startTime = Date.now();
        try {
            new sn_entitlement.EntitlementsDisplayDetailsDownloader().downloadAndProcessEntitlementsDisplayDetails();
        } catch (e) {
            this.logger.logError(LICENSING_ENGINE, ENTITLEMENT_DISPLAY_DETAILS_DOWNLOAD, `Execution of licensing engine : Subscription Entitlements Display Details Download failed : ${e}`, DOWNLOAD_CODE, LICENSING_ENGINE + "." + ENTITLEMENT_DISPLAY_DETAILS_DOWNLOAD);
        }
        this.logger.logInfo(LICENSING_ENGINE, ENTITLEMENT_DISPLAY_DETAILS_DOWNLOAD, `Licensing Engine Download finished, elapsed time(ms) : ${Date.now() - startTime}`);

        // For On-prem instance, we don't upload the roles, so, skip running Role Anaylzer 
        const startRoleDiscovery = Date.now();
        //Discover Custom Licensable Roles
        try {
            if (skipRoleAnalyzerAndSyncSteps)
                this.logger.logInfo(LICENSING_ENGINE, DISCOVER_CUSTOM_LICENSABLE_ROLES, `Licensing Engine Role Discovery skipped`);
            else {
                const licenseRoleDiscoveryService = new LicenseRoleDiscoveryService();
                licenseRoleDiscoveryService.analyzeCustomRoles();
                licenseRoleDiscoveryService.analyzeCustomizedOutOfTheBoxRoles();
            }
        } catch (e) {
            this.logger.logError(LICENSING_ENGINE, DISCOVER_CUSTOM_LICENSABLE_ROLES, `Execution of licensing engine : Role Discovery failed : ${e}`, ROLE_ANALYZER_CODE, LICENSING_ENGINE + "." + DISCOVER_CUSTOM_LICENSABLE_ROLES);
        }
        this.logger.logInfo(LICENSING_ENGINE, DISCOVER_CUSTOM_LICENSABLE_ROLES, `Licensing Engine Role Discovery finished, elapsed time(ms) : ${Date.now() - startRoleDiscovery}`);

        //Upload And Download Roles
        const startRoles = Date.now();
        try {
            if (skipRoleAnalyzerAndSyncSteps)
                this.logger.logInfo(LICENSING_ENGINE, UPLOAD_AND_DOWNLOAD_ROLES, `Licensing Engine Role Sync skipped`);
            else
                new RoleSyncer().syncRoles();
        } catch (e) {
            this.logger.logError(LICENSING_ENGINE, UPLOAD_AND_DOWNLOAD_ROLES, `Execution of licensing engine : Role Sync failed : ${e}`, ROLE_SYNC_CODE, LICENSING_ENGINE + "." + UPLOAD_AND_DOWNLOAD_ROLES);
        }
        this.logger.logInfo(LICENSING_ENGINE, UPLOAD_AND_DOWNLOAD_ROLES, `Licensing Engine Role Sync finished, elapsed time(ms) : ${Date.now() - startRoles}`);
    }

    //Update user_has_subscription table
    const startUserHasSubscription = Date.now();
    try {
        new sn_entitlement.UserSubscriptionMapper().syncUsersToSubscriptions();
    } catch (e) {
        this.logger.logError(LICENSING_ENGINE, SYNC_USER_HAS_SUBSCRIPTION, `Execution of licensing engine : Sync user_has_subscription failed : ${e}`, SYNC_USER_HAS_SUBSCRIPTION_CODE, LICENSING_ENGINE + "." + SYNC_USER_HAS_SUBSCRIPTION);
    }
    this.logger.logInfo(LICENSING_ENGINE, SYNC_USER_HAS_SUBSCRIPTION, `Licensing Engine Sync user_has_subscription finished, elapsed time(ms) : ${Date.now() - startUserHasSubscription}`);


    //Subscription Details
    const startSubscriptionDetails = Date.now();
    try {
        new sn_entitlement.SubscriptionDetailService().createSubscriptionDetailsSafely();
    } catch (e) {
        this.logger.logError(LICENSING_ENGINE, SUBSCRIPTION_DETAILS, `Execution of licensing engine : Subscription Details failed : ${e}`, SUBSCRIPTION_DETAILS_CODE, LICENSING_ENGINE + "." + SUBSCRIPTION_DETAILS);
    }
    this.logger.logInfo(LICENSING_ENGINE, SUBSCRIPTION_DETAILS, `Licensing Engine Subscription Details finished, elapsed time(ms) : ${Date.now() - startSubscriptionDetails}`);


    //MIF creator table data population
    const creatorUsersSync = Date.now();
    try {
        new sn_entitlement.CreatorUsersUploadSyncer().sync();
    } catch (e) {
        this.logger.logError(LICENSING_ENGINE, CREATOR_USERS_SYNC, `Execution of licensing engine : Creator Users Upload Sync failed : ${e}`, CREATOR_USERS_SYNC_CODE, LICENSING_ENGINE + "." + CREATOR_USERS_SYNC);
    }
    this.logger.logInfo(LICENSING_ENGINE, CREATOR_USERS_SYNC, `Licensing Engine Creator Users Upload Sync finished, elapsed time(ms) : ${Date.now() - creatorUsersSync}`);

    // Check for and populate app engine v1 usage and set nav module to active if found
    try {
        var isAppEngineV1 = global.AppEngineV1GlobalHelper.isAppEngineV1();

        if(isAppEngineV1) {
            global.AppEngineV1GlobalHelper.appEngineV1Populate();
        }
        
        // we need to run this even if isAppEngineV1 is false, so that we can be sure to turn the module off if a customer were to move off of
        // app engine v1
        sn_sub_man.AppEngineUsageNavHelper.setAppEngineV1Nav(isAppEngineV1);

    } catch (e) {
        this.logger.logError(LICENSING_ENGINE, APP_ENGINE_V1_ISSUES, `Execution of licensing engine : App Engine v1 support failed : ${e}`, APP_ENGINE_V1_ISSUES_CODE, LICENSING_ENGINE + "." + APP_ENGINE_V1_ISSUES);
    }

    this.logger.logInfo(LICENSING_ENGINE, LICENSING_ENGINE, `Licensing Engine operations finished, elapsed time(ms) : ${Date.now() - start}`);
}

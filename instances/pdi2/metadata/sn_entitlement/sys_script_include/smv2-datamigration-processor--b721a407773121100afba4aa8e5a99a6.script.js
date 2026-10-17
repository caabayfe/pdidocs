var SMv2_DataMigration_Processor = Class.create();
SMv2_DataMigration_Processor.prototype = {
    initialize: function(retryCount) {
        this._logger = new LoggingUtil();
        this._failureCode = "LIC8000";// to reference message in LicensingEngineConstants.LICENSING_ERROR_CODES
        if (isNaN(retryCount)) {
            this._logger.logError(this.type, "initialize", 'Invalid retry count, exiting data migration process');
            throw new TypeError('Invalid argument type. Expected integer value.');
        }

        this._retryCount = parseInt(retryCount);
        this.MAX_RETRIES = parseInt(gs.getProperty(LicensingEngineConstants.MAX_RETRY_DEFAULT_COUNT_PROPERTY_KEY, LicensingEngineConstants.MAX_RETRY_DEFAULT_COUNT));

        this._entitlementUtils = new sn_lef.EntitlementEngineUtils();
        this._globalHelper = new global.LicensingEngineGlobalHelper();
        this._licensingEngineNavMenuHelper = new LicensingEngineNavMenuHelper();
        this._subscriptionDetailConsolidator = new SMv2_SubscriptionDetail_Consolidator();
    },
    process: function() {
        this._logger.logInfo(this.type, "process", `Data migration process initiated`);
        const migrationCompleted = this._entitlementUtils.getEntitlementEnginePropValue(LicensingEngineConstants.PROP_SM_CUSTOMER_INSTANCE_MIGRATED);
        if (global.LicensingScriptUtil.toBoolean(migrationCompleted)) {
            this._logger.logInfo(this.type, "process", "The migration process has already been finished.");
            return;
        }

        const surfRouting = this._entitlementUtils.getEntitlementEnginePropValue(LicensingEngineConstants.PROP_GLIDE_ENTITLEMENT_SURF_ROUTING);
        if (global.LicensingScriptUtil.toBoolean(surfRouting)) {
            this._logger.logInfo(this.type, "process", "Instance using SMv1 route, exit data migration");
            return;
        }
        //Only continue if surf_routing == false and migration_complete flag = false

        if (!GlidePluginManager.isActive('com.glide.subscription_management')) {
            this._logger.logInfo(this.type, "process", `Required app 'sn_sub_man'is missing, continue to retry...`);
            //not incrementing retry count so that we retry until app is installed.
            this._createEvent(this._retryCount);
            return;
        }

        this._disableSMv1();

        let allStepsCompleted = false;
        if (this._retryCount >= 0 && this._retryCount < this.MAX_RETRIES) {
            try {
                //step 1: Initiate subscription entitlement download job
                this._downloadEntitlements();

                //step 2: Initiate SMv1 data migration
                this._migrateEntitlementData();

                //step 3: Initialize subscription_details data creation
                this._generateSubscriptionDetails();
                allStepsCompleted = true;
            } catch (ex) {
                this._logger.logError(this.type, "process", `Error during migration process, failed to complete migration. Error: ${ex}!`);
                if (++this._retryCount < this.MAX_RETRIES) {
                    this._logger.logInfo(this.type, "process", `Retry migration... count: ${this._retryCount}`);
                    this._createEvent(this._retryCount);
                    return;
                }
            }
        }

        if (this._retryCount >= this.MAX_RETRIES)
            this._logger.logError(this.type, "process", "Error: Maximum retry limit has been reached. Migration failed!");

        if (allStepsCompleted) {
            this._entitlementUtils.setEntitlementEngineProp(LicensingEngineConstants.PROP_SM_CUSTOMER_INSTANCE_MIGRATED, true);
            this._entitlementUtils.platLicPostProcess(); // Invoke this to refresh cache which is needed for custom tables mapping
            this._logger.logInfo(this.type, "process", "Migration process complete");

            // Generate SMV2 recommendations for unmapped global custom tables and unmapped custom applications
            try {
                new GlobalCustomTableRecommendationService().recommendSubscriptions();
                new UnmappedCustomApplicationRecommendationService().recommendSubscriptions();
            } catch (ex) {
                this._logger.logError(this.type, "process", `Error during migration process, failed to generate` +
                `unmapped global custom table and unmapped custom application recommendations. Error: ${ex}!`);
            }
        } else {
            this._entitlementUtils.setEntitlementEngineProp(LicensingEngineConstants.PROP_SM_CUSTOMER_INSTANCE_MIGRATED, false);
            this._logger.logError(this.type, "process", LicensingEngineConstants.LICENSING_ERROR_CODES[this._failureCode], this._failureCode, LicensingEngineConstants.LICENSING_ERROR_TYPES.MIGRATION);
        }
    },
    _createEvent: function(count) {
        gs.eventQueue("sn_entitlement.migrate_data", null, count, null);
    },
    _downloadEntitlements: function() {
        this._logger.logInfo(this.type, "_downloadEntitlements", "Initiate subscription entitlement download.");
        const entitlementDownloaderJobSysID = 'aa68c404ffff2110d185612a453bf175';
        let sleepRetryCount = 0;
        while (sleepRetryCount++ < this.MAX_RETRIES && this._isJobRunning(entitlementDownloaderJobSysID)) {
            this._logger.logInfo(this.type, "_downloadEntitlements", "Waiting for subscription entitlement download job to complete");
            this._globalHelper.sleep(sleepRetryCount * 1000);
        }

        let downloadSuccessful = this._entitlementUtils.getEntitlementEnginePropValue(LicensingEngineConstants.PROP_GLIDE_ENTITLEMENT_EMS_DATA_AVAILABLE);
        if (global.LicensingScriptUtil.notNil(downloadSuccessful) && global.LicensingScriptUtil.toBoolean(downloadSuccessful)) {
            this._logger.logInfo(this.type, "_downloadEntitlements", "Entitlement data already available.");
            return;
        }
        new sn_entitlement.EntitlementDownloader().downloadEntitlements();
        downloadSuccessful = this._entitlementUtils.getEntitlementEnginePropValue(LicensingEngineConstants.PROP_GLIDE_ENTITLEMENT_EMS_DATA_AVAILABLE);
        if (global.LicensingScriptUtil.nil(downloadSuccessful) || !global.LicensingScriptUtil.toBoolean(downloadSuccessful)) {
            this._logger.logInfo(this.type, "_downloadEntitlements", "failed to download entitlements");
            throw Error("Failed to download entitlements!");
        }
    },
    _migrateEntitlementData: function() {
        this._logger.logInfo(this.type, "_migrateEntitlementData", "Initiate SMv1 data migration");
        const migrateDataStatus = new MigrateLicenseDataToSMV2().migrate();
        this._logger.logInfo(this.type, "_migrateEntitlementData", "Status: " + JSON.stringify(migrateDataStatus));
        migrateDataStatus.forEach((status) => {
            if (global.LicensingScriptUtil.toBoolean(status.isSystemException))
                throw new Error(status.message);

        });
    },
    _generateSubscriptionDetails: function() {
        this._logger.logInfo(this.type, "_generateSubscriptionDetails", "Initialize subscription_details data creation");
        var start = Date.now();
        new sn_entitlement.SubscriptionDetailService().createSubscriptionDetails();
        //post operation consolidation of migrated subscription details entries (DEF0483933)
        this._consolidateSubscriptionDetails();
        this._logger.logInfo(this.type, "_generateSubscriptionDetails", `elapsed time(ms) : ${Date.now() - start}`);
    },
    _consolidateSubscriptionDetails: function() {
        try {
            this._subscriptionDetailConsolidator.consolidate();
        } catch (ex) {
            this._logger.logError(this.type, "process", `Error during consolidation process, failed to consolidate` +
                ` migrated subscription details entries. Error: ${ex}!`);
        }
    },
    _disableSMv1: function() {
        this._logger.logInfo(this.type, "_disableSMv1Modules", "Disabling SMv1 modules and download job");
        this._globalHelper.disableAllSMv1Modules();
        this._globalHelper.disableSMv1LicenseDownloadJob();
    },
    _disableSMv2: function() {
        this._logger.logInfo(this.type, "_disableSMv2Modules", "Disabling SMv2 modules and download job");
        this._globalHelper.disableAllSMv2Modules();
    },
    _enableSMv1: function() {
        this._logger.logInfo(this.type, "_enableAllSMv1Modules", "Enabling SMv1 modules");
        this._licensingEngineNavMenuHelper.enableAllSMv1Modules();
    },
    _enableSMv2: function() {
        this._logger.logInfo(this.type, "_enableSMv2Modules", "Enabling SMv2 modules and download job");
        this._globalHelper.enableAllSMv2Modules();
    },
    _isJobRunning: function(jobDocKey) {
        if (global.LicensingScriptUtil.nil(jobDocKey))
            return false;

        let jobStatus = null;
        let triggerGR = new GlideRecord('sys_trigger');
        if (triggerGR.get('document_key', jobDocKey))
            jobStatus = triggerGR.getValue('state');

        if (global.LicensingScriptUtil.notNil(jobStatus) && jobStatus === '1' /** Running */ )
            return true;

        return false;
    },
    type: 'SMv2_DataMigration_Processor'
};

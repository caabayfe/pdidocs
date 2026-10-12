var LifeCycleFieldsAlignmentJobUtil = Class.create();
LifeCycleFieldsAlignmentJobUtil.prototype = {
    logger: null,
    lifecycleUtil: new LifeCycleUtil(),
    jobCtxMgr: new CMDBJobContextManager(),
    initialize: function() {
        this.logger = new GSLog(this.lifecycleUtil.LOG_LEVEL_PROPERTY, this.type);
    },
    KEY: "csdm.lifecycle.fields.alignment.job.context",

    scheduleMigrationJob: function() {
        var grTrigger = new GlideRecord("sys_trigger");
        grTrigger.initialize();
        grTrigger.setValue("state", 0); // ready
        grTrigger.setValue("trigger_type", 1); // repeate
        grTrigger.setValue("repeat", "1970-01-01 00:01:00"); // every 1 min
        grTrigger.setValue("next_action", new GlideDateTime()); // start immediately
        grTrigger.setValue("name", this.KEY);
        grTrigger.setValue("script", "new LifeCycleFieldsAlignmentJobUtil().run();");
        grTrigger.insert();
    },

    cancelMigrationJob: function() {
        var grTrigger = this._getSysTriggerEntryForJob();
        if (!gs.nil(grTrigger))
            grTrigger.deleteRecord();
    },

    isMigrationRunning: function() {
        var grTrigger = this._getSysTriggerEntryForJob();
        return !gs.nil(grTrigger);

    },
    _getSysTriggerEntryForJob: function() {
        var grTrigger = new GlideRecord("sys_trigger");
        grTrigger.addQuery("name", this.KEY);
        grTrigger.query();
        if (grTrigger.next())
            return grTrigger;
        else
            return null;
    },

    run: function() {
        try {
            var jobCtx = this._getJobContext();

            //Note: We process TBD records first to avoid reprocessing TBD records added by step1.2
            //Step1.1: Populate lifecycle values for all assets having TBD as lifeCycle value
            //Go through all Assets that has TBD as Lifecycle values and derive new lifecycle values from legacy fields using CSDM mapping rules for Asset tables.
            if (jobCtx.lifecycleValuePopulatedForAssetWithTBDValue != true) {
                var bulkPopulateUtil = new LifeCycleBulkPopulateUtil(this.logger);
                bulkPopulateUtil.runOnlyForTBD();
                var lifecycleValuePopulatedForAssetWithTBDValue = bulkPopulateUtil.run("alm_asset");
                if (lifecycleValuePopulatedForAssetWithTBDValue === true) {
                    // Step finish
                    jobCtx.lifecycleValuePopulatedForAssetWithTBDValue = true;
                    this.jobCtxMgr.saveJobContext(this.KEY, "", JSON.stringify(jobCtx));
                }
                return;
            }

            //Step1.2: Populate lifecycle values for all assets having empty lifeCycle value
            //Go through all Assets that has missing Lifecycle values and derive new lifecycle values from legacy fields using CSDM mapping rules for Asset tables.
            if (jobCtx.lifecycleValuePopulatedForAssetWithEmptyValue != true) {
                var bulkPopulateUtil = new LifeCycleBulkPopulateUtil(this.logger);
                var lifecycleValuePopulatedForAssetWithEmptyValue = bulkPopulateUtil.run("alm_asset");
                if (lifecycleValuePopulatedForAssetWithEmptyValue === true) {
                    // Step finish
                    jobCtx.lifecycleValuePopulatedForAssetWithEmptyValue = true;
                    this.jobCtxMgr.saveJobContext(this.KEY, "", JSON.stringify(jobCtx));
                }
                return;
            }



            //Step2: Copy lifecycle values from asset records to corresponding CI if mismatch
            //Synchronize the lifecycle field values between CI and Asset, chunk-by-chunk, if they do not match.
            if (jobCtx.lifecycleValueSynchronizedBetweenCIAndAsset != true) {
                var lifecycleValueSynchronizedBetweenCIAndAsset = new LifeCycleFieldsSynchronizer(this.logger).run();
                if (lifecycleValueSynchronizedBetweenCIAndAsset === true) {
                    //Step finish
                    jobCtx.lifecycleValueSynchronizedBetweenCIAndAsset = true;
                    this.jobCtxMgr.saveJobContext(this.KEY, "", JSON.stringify(jobCtx));
                }
                return;
            }

            //Note: We process TBD records first to avoid reprocessing TBD records added by step1.2
            //Step3.1: Populate lifecycle values for CI without assets having TBD as life cycle value
            //Go through all non-asset CIs and derive the lifecycle values using CSMD lifecycle Mapping Rules for CMDB tables.
            if (jobCtx.lifecycleValuePopulatedForCIsWithoutAssetWithTBDValue != true) {
                var bulkPopulateUtil = new LifeCycleBulkPopulateUtil(this.logger);
                bulkPopulateUtil.runOnlyForNonAssetCI();
                bulkPopulateUtil.runOnlyForTBD();
                var lifecycleValuePopulatedForCIsWithoutAssetWithTBDValue = bulkPopulateUtil.run("cmdb_ci");
                if (lifecycleValuePopulatedForCIsWithoutAssetWithTBDValue === true) {
                    // Step finish
                    jobCtx.lifecycleValuePopulatedForCIsWithoutAssetWithTBDValue = true;
                    this.jobCtxMgr.saveJobContext(this.KEY, "", JSON.stringify(jobCtx));
                } else
                    return; //not yet finish!! continue running in next occurrence
            }

            //Step3.2: Populate lifecycle values for CI without assets having empty life cycle value
            //Go through all non-asset CIs and derive the lifecycle values using CSMD lifecycle Mapping Rules for CMDB tables.
            if (jobCtx.lifecycleValuePopulatedForCIsWithoutAssetWithEmptyValue != true) {
                var bulkPopulateUtil = new LifeCycleBulkPopulateUtil(this.logger);
                bulkPopulateUtil.runOnlyForNonAssetCI();
                var lifecycleValuePopulatedForCIsWithoutAssetWithEmptyValue = bulkPopulateUtil.run("cmdb_ci");
                if (lifecycleValuePopulatedForCIsWithoutAssetWithEmptyValue === true) {
                    // Step finish
                    jobCtx.lifecycleValuePopulatedForCIsWithoutAssetWithEmptyValue = true;
                    this.jobCtxMgr.saveJobContext(this.KEY, "", JSON.stringify(jobCtx));
                } else
                    return; //not yet finish!! continue running in next occurrence
            }

            this.logger.logInfo("Lifecycle fields bulk migration job completed successfully");
            this.logger.logInfo("Clean up entry from cmdb_job_context table for KEY: " + this.KEY + " VALUE:" + JSON.stringify(jobCtx));
        } catch (ex) {
            // When any of the above steps throws exception
            this.logger.logErr("ERROR:" + ex.message + " STACK_TRACE:" + ex.stack);
            // On Error delete the job context
            this.logger.logErr("Error occurred in " + this.type + ". Clean up entry from cmdb_job_context table for KEY: " + this.KEY + " VALUE:" + JSON.stringify(jobCtx));
        }
        // clean up job context entry
        this.jobCtxMgr.deleteJobContext(this.KEY);
        // delete the sys_trigger job
        this.cancelMigrationJob();
    },

    _getJobContext: function() {
        var jobCtx = this.jobCtxMgr.getJobContextJSONValue(this.KEY);
        if (jobCtx == null) {
            // First occurrence of the Job. Initialize cmdb_job_context table
            jobCtx = this._initializeJobContext();
            this.logger.logInfo("Starting lifecycle fields bulk migration job");
        }
        return jobCtx;
    },

    /**
     * Initialize the job context before we start the bulk population for CSDM lifecycle fields.
     */
    _initializeJobContext: function() {
        var jobCtx = {
            lifecycleValuePopulatedForAssetWithEmptyValue: "false",
            lifecycleValuePopulatedForAssetWithTBDValue: "false",
            lifecycleValueSynchronizedBetweenCIAndAsset: "false",
            lifecycleValuePopulatedForCIsWithoutAssetWithEmptyValue: "false",
            lifecycleValuePopulatedForCIsWithoutAssetWithTBDValue: "false"
        };

        this.jobCtxMgr.saveJobContext(this.KEY, "", JSON.stringify(jobCtx));
        return jobCtx;
    },


    type: 'LifeCycleFieldsAlignmentJobUtil'
};

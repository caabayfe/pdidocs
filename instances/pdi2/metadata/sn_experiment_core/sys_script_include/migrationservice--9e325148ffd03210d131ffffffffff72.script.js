var MigrationService = Class.create();
MigrationService.prototype = {
    initialize: function() {},

    migrateAllData: function() {
        gs.info('[Migration] Starting Full Migration ');
        try {
            this.migrateExistingExperiments();
            this.migrateUnProcessedExperiments();
            this.updateCDSScheduledTime();
            this.updateCDSFilter();
            new sn_experiment_core.ExperimentUIService().oneTimeCDSScheduler();

        } catch (ex) {
            gs.error('[Migration] Error in migrateAllData: ' + ex.message);
        } finally {
            gs.setProperty(ExperimentationConstants.UPGRADED_PROPERTY, true);
        }
        gs.info('[Migration] Migration Completed');
    },

    migrateExistingExperiments: function() {
        gs.info('[Migration] Starting migration of experiments and variants');
        try {
            var oldExp = new GlideRecord(ExperimentationConstants.OLD_EXPERIMENT_TABLE);
            oldExp.query();

            while (oldExp.next()) {
                this._createNewExperiment(oldExp);
            }
            gs.info('[Migration] Experiment migration completed successfully.');
        } catch (ex) {
            gs.error('[Migration] Error migrating experiments: ' + ex.message);
        }
    },

    _createNewExperiment: function(oldExp) {
        var newExp = new GlideRecord(ExperimentationConstants.EXPERIMENT_TABLE);
        newExp.initialize();

        for (var oldField in ExperimentationConstants.EXPERIMENT_TABLE_MAP) {
            var newField = ExperimentationConstants.EXPERIMENT_TABLE_MAP[oldField];
            newExp.setValue(newField, oldExp.getValue(oldField));
        }
        newExp.setNewGuidValue(oldExp.getValue("sys_id"));
        newExp.setValue('category', ExperimentationConstants.EXPERIMENT_CATEGORY.AB_TESTING);
        var newExpSysId = newExp.insert();
        gs.info('[Migration] Experiment migrated: old=' + oldExp.sys_id + ', new=' + newExpSysId);

        this._migrateVariants(oldExp.sys_id, newExpSysId);

        var gcfDef = oldExp.getValue('gcf_definition_id');
        if (gcfDef) {
            this._createMetricMapping(oldExp, newExpSysId);
        }
    },

    _migrateVariants: function(oldExpSysId, newExpSysId) {
        var oldVar = new GlideRecord(ExperimentationConstants.OLD_VARIANT_TABLE);
        oldVar.addQuery('experiment', oldExpSysId);
        oldVar.query();

        while (oldVar.next()) {
            var newVar = new GlideRecord(ExperimentationConstants.VARIANT_TABLE);
            newVar.initialize();

            for (var oldField in ExperimentationConstants.VARIANT_TABLE_MAP) {
                var newField = ExperimentationConstants.VARIANT_TABLE_MAP[oldField];
                newVar.setValue(newField, oldVar.getValue(oldField));
            }

            newVar.setValue('parent_table', ExperimentationConstants.EXPERIMENT_TABLE);
            newVar.setValue('parent_id', newExpSysId);
            newVar.setNewGuidValue(oldVar.getValue("sys_id"));
            newVar.insert();
        }
    },

    _createMetricMapping: function(oldExp, newExpSysId) {
        var metric = new GlideRecord(ExperimentationConstants.METRIC_MAPPING_TABLE);
        metric.initialize();
        metric.setValue('definition_id', oldExp.getValue('gcf_definition_id'));
        metric.setValue('experiment', newExpSysId);

        var metadata = {
            instrumentation_category: oldExp.getValue('category'),
            instrumentation_point: oldExp.getValue('instrumentation_point'),
            instrumentation_event: oldExp.getValue('instrumentation_event')
        };

        metric.setValue('metadata', JSON.stringify(metadata));
        metric.insert();
    },

    migrateUnProcessedExperiments: function() {
        var gr = new GlideRecord(ExperimentationConstants.OLD_STAGING_TABLE);
        gr.addQuery('status', 'unprocessed');
        gr.orderBy('u_created_time');
        gr.query();

        while (gr.next()) {
            var stagingGr = new GlideRecord(ExperimentationConstants.NEW_STAGING_TABLE);
            stagingGr.initialize();
            stagingGr.setValue("payload", gr.payload);
            stagingGr.setValue("u_created_time", gr.u_created_time);
            stagingGr.setValue("target_record", gr.target_record);
            stagingGr.insert();
        }
        gs.info('[Migration] Unprocessed experiments migrated.');
    },

    updateCDSScheduledTime: function() {
        var record = new GlideRecord(ExperimentationConstants.CDS_SCHEDULE_TABLE);
        if (!record.isValid()) {
            gs.error('[Migration] Migration Service : cds_client_schedule table check failed. Aborting.');
            return;
        }

        if (record.get(ExperimentationConstants.CDS_SCHEDULE_SYSID)) {
            var instanceId = gs.getProperty("instance_id");
            var hash = new sn_experiment_core.FnvHashGenerator().hash(instanceId);
            var timeInMs = (Number(hash) % 1440) * 60 * 1000;
            var date = new Date(timeInMs);
            var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            record.setValue('run_time', time);
            record.update();
            gs.info('[Migration] Migration Service: random CDS scheduler time set: ' + time);
        }
    },

    updateCDSFilter: function() {
        var record = new GlideRecord(ExperimentationConstants.CDS_REGISTRY_TABLE);
        if (!record.isValid()) {
            gs.error('[Migration] Migration Service : cds_client_registry table check failed. Aborting.');
            return;
        }

        if (record.get(ExperimentationConstants.CDS_REGISTRY_SYSID)) {
            var releaseVersion = new sn_experiment_core.ReleaseVersionResolver().resolveReleaseVersion();
            record.setValue('server_filter_criteria',
                CDSClientConstants.QUERY_PARAM_RELEASE_VERSION + "=" + releaseVersion);
            record.update();
            gs.info('[Migration] Migration Service: filter update with release_version=' + releaseVersion);
        }
    },

    type: 'MigrationService'
};

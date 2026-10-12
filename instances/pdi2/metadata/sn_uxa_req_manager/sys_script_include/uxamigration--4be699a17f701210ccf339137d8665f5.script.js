var UXAMigration = Class.create();
UXAMigration.prototype = {
    initialize: function() {
        this.migrationComplete = gs.getProperty('sn_uxa_req_manager.migration_job_status') || 'not started';
        this.MAX_RETRY_COUNT = 5;
        this.currentRetryCount = parseInt(gs.getProperty('sn_uxa_req_manager.current_migration_retry_count') || 0);
    },
    updateSysProperty: function(name, value, type) {
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('name', name);
        gr.query();
        if (gr.next()) {
            gr.setValue('value', value);
            if (type)
                gr.setValue('type', type);
            gr.setWorkflow(false);
            gr.update();
        }
    },
    getRetryCount: function() {
        return {
            max: this.MAX_RETRY_COUNT,
            current: this.currentRetryCount
        };
    },
    migrate: function() {
        try {

            this.updateSysProperty('sn_uxa_req_manager.current_migration_retry_count', ++this.currentRetryCount, 'integer');
            this.updateSysProperty('sn_uxa_req_manager.migration_job_status', 'in progress', 'string');
            var appScreens = new UXAAppScreensMigration();
            appScreens.migratePages();
            var funnels = new UXAFunnelMigration();
            funnels.migrateFunnels();
            var cohorts = new UXACohortMigration();
            cohorts.migrateCohorts();
            gs.info('UXA Migration job for AppScreen ran completely, current status - ' + 'complete');
            this.updateSysProperty('sn_uxa_req_manager.migration_job_status', 'complete', 'string');
        } catch (ex) {
            gs.error('UXA Migration job for AppScreen failed - ' + JSON.stringify(ex));
            this.updateSysProperty('sn_uxa_req_manager.migration_job_status', 'failed', 'string');
        }
    },
    isMigrationComplete: function() {
        return this.migrationComplete;
    },
    type: 'UXAMigration'
};

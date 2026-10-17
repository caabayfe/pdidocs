const DEFAULT_IGNORED_TABLES = ['sys_metadata_link', 'sys_module', 'sys_ux_lib_asset'].join(',');

var IDEMetadataSync = Class.create();
IDEMetadataSync.prototype = {
    initialize: function() {
        this._ignoredTables = gs.getProperty('sn_glider.sync.ignored_tables', DEFAULT_IGNORED_TABLES)?.split(',');
        this._isAutoSyncDisabled = gs.getProperty('sn_glider.sync.disable_background_execution', 'false') === 'true';
    },
    getIgnoredTables() {
        return this._ignoredTables;
    },
    isAutoSyncDisabled() {
        return this._isAutoSyncDisabled;
    },
    isFluentApp: function(scopeId) {
        var gr = new GlideRecord("sys_app");
        gr.addNotNullQuery("package_json");
        gr.addNotNullQuery("sys_modules");
        gr.addActiveQuery();
        gr.addQuery('sys_id', scopeId);
        gr.setLimit(1);
        gr.query();
        return gr.hasNext();
    },
    appHasSourceFiles: function(scopeId, excludePaths) {
        var gr = new GlideRecord('sn_glider_ide_file_index');
        var root = 'now-file:/' + scopeId;
        gr.addQuery('uri', 'STARTSWITH', root + '/');
        gr.addQuery('type', 'file');
        gr.addNullQuery('dtime');
        if (excludePaths) {
            for (var i = 0; i < excludePaths.length; i++) {
                gr.addQuery('uri', 'DOES NOT CONTAIN', excludePaths[i]);
            }
        }
        gr.setLimit(1);
        gr.query();
        return gr.hasNext();
    },
    queueSyncRequest(scopeId) {
        if (this.isAppActiveInQueue(scopeId)) {
            gs.warn(`Cannot sync application ${scopeId} it's currently running/waiting in the sync queue`);
            return;
        }
        const gr = new GlideRecord('sn_glider_ide_sync_job_queue');
        gr.initialize();
        gr.setValue('application', scopeId);
        gr.setValue('status', 'active');
        return gr.insert();
    },
    isAppActiveInQueue(scopeId) {
        const gr = new GlideRecord('sn_glider_ide_sync_job_queue');
        gr.addQuery('application', scopeId);
        gr.addQuery('status', 'active');
        gr.setLimit(1);
        gr.query();
        return gr.hasNext();
    },
    updateSyncRequestStatus(scopeId, newStatus) {
        const gr = new GlideRecord('sn_glider_ide_sync_job_queue');
        gr.addQuery('application', scopeId);
        gr.query();
        while (gr.next()) {
            gr.setValue('status', newStatus);
        }
        gr.updateMultiple();
    },
    clearSyncRequests(scopeId) {
        const gr = new GlideRecord('sn_glider_ide_sync_job_queue');
        gr.addQuery('application', scopeId);
        gr.addQuery('status', 'active');
        gr.query();
        gr.deleteMultiple();
    },
    getJobsToRun() {
        const jobIds = new Set();
        const gr = new GlideRecord('sn_glider_ide_sync_job_queue');
        gr.addQuery('status', 'active');
        gr.query();
        while (gr.next()) {
            jobIds.add(gr.getValue('application'));
        }
        return [...jobIds];
    },
    shouldRun(scopeId, tableName) {
        // If we somehow get no scope id, we quit
        if (!scopeId) return false;

        // If we get a table that's ignored by sync
        if (this.getIgnoredTables().includes(tableName)) return false;

        // If there's no files in the application, we quit
        if (!this.appHasSourceFiles(scopeId, ['/node_modules/', '/.git/'])) return false;

        // Otherwise run sync
        return true;
    },

    type: 'IDEMetadataSync'
};

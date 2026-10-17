var AisMigrationLogger = Class.create();
AisMigrationLogger.prototype = {

    initialize: function(migrationSysId, source) {
        this.migrationSysId = migrationSysId;
        this.source = source;
    },

    info: function(message) {
        gs.info(message);
        this._log('info', message);
    },

    warn: function(message) {
        gs.warn(message);
        this._log('warn', message);
    },

    error: function(message) {
        gs.error(message);
        this._log('error', message);
    },

    errorWithException: function(message, exception) {
        gs.error(message, exception);
        this._log('error', message);
    },


    _log: function(level, message) {
        var gr = new GlideRecord('sn_aisearch_global_job_log');
        gr.initialize();
        gr.setValue('level', level);


        message = '[' + this.source + '] ' + message;

        gr.setValue('message', message);
        gr.setValue('sn_aisearch_global_migration_job', this.migrationSysId);
        gr.insert();
    },

    type: 'AisMigrationLogger'
};

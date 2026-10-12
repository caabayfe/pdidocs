var AisMigrationIndexer = Class.create();
AisMigrationIndexer.prototype = {
    initialize: function(migrationSysID) {
        this.logger = new AisMigrationLogger(migrationSysID, 'Indexer');
        this.migrationSysID = migrationSysID;
    },

    indexAllSources: function() {
        var utils = new sn_aisearch_global.AISMigrationUtils();
        var dataSources = utils.getDataSourcesToIndex(this.migrationSysID);

        for (var i in dataSources) {
            var dataSource = dataSources[i];
            this.logger.info("Creating index event for: " + dataSource);
            new sn_ais.IndexEvent().indexTable(dataSource);


            var dataSourceStatsGr = new GlideRecord("ais_ingest_datasource_stats");
            dataSourceStatsGr.orderByDesc('sys_created_on');
            dataSourceStatsGr.addQuery('datasource', dataSource);
            dataSourceStatsGr.setLimit(1);
            dataSourceStatsGr.query();
            if (!dataSourceStatsGr.next()) {
                this.logger.warn('Unable to locate the stats record for ' + dataSource);
                continue;
            }

            var ingestHistoryGr = new GlideRecord('sn_aisearch_global_job_ingest_history');
            ingestHistoryGr.initialize();
            ingestHistoryGr.setValue('sn_aisearch_global_migration_job', this.migrationSysID);
            ingestHistoryGr.setValue('ais_ingest_datasource_stats', dataSourceStatsGr.sys_id);
            ingestHistoryGr.insert();
        }
    },

    type: 'AisMigrationIndexer'
};

var AisMigrationReverter = Class.create();
AisMigrationReverter.prototype = {
    initialize: function(migrationSysID) {
        this.sysIDLookup = {};
        this.utils = new sn_aisearch_global.AISMigrationUtils(migrationSysID);
        this.logger = new sn_aisearch_global.AisMigrationLogger(migrationSysID, 'Reverter');
        this.migrationSysID = migrationSysID;
    },

    revertAll: function() {
        this._revertStagedRecords();
        this._removeIndexHistoryRecords();
        this._publishProfile();
    },

    _revertStagedRecords: function(queryField, queryValue) {
        var migrationStagingGr = new GlideRecord('sn_aisearch_global_job_staging');
        migrationStagingGr.addQuery('state', 'accept');
        migrationStagingGr.addQuery('migration_orchestration', this.migrationSysID);
        if (queryField && queryValue) {
            migrationStagingGr.addQuery(queryField, queryValue);
        }
        migrationStagingGr.orderByDesc('sequence'); //revert in the reverse order of inserts
        migrationStagingGr.query();

        while (migrationStagingGr.next()) {
            var operation = migrationStagingGr.getValue('operation');
            var destinationTable = migrationStagingGr.getValue('table_name');
            var destinationSysID = migrationStagingGr.getValue('table_sys_id');

            if (operation == 'insert') {
                var destinationGr = new GlideRecord(destinationTable);
                destinationGr.get(destinationSysID);
                if (destinationGr) {
                    this.sysIDLookup['sn_aisearch_global_job_staging_' + migrationStagingGr.getUniqueValue()] = destinationGr.getUniqueValue();
                    destinationGr.deleteRecord();
                }
            } else {
                this.logger.info("Trying to find a record for undo in table: " + destinationTable + " . sys_id: + " + destinationSysID + ". ");
                var migrationStagingChangeGr = new GlideRecord('sn_aisearch_global_job_staging_change');
                migrationStagingChangeGr.addQuery('migration_staging_record', migrationStagingGr.getUniqueValue());
                migrationStagingChangeGr.query();
                try {
                    this._undoChanges(migrationStagingChangeGr, destinationTable);
                } catch (e) {
                    this.logger.errorWithException("An error occurred while undoing changes for a record in table: " + destinationTable + " . sys_id: + " + destinationSysID + ". ", e);
                }
            }
        }
    },

    _undoChanges: function(migrationStagingChangeGr, destinationTable) {
        var destinationGr = new GlideRecord(destinationTable);
        var changes = "";
        var previousValues = {};

        if (!migrationStagingChangeGr.hasNext()) {
            this.logger.warn("No conditions found. Aborting this delete operation");
            return;
        }

        while (migrationStagingChangeGr.next()) {
            var fieldName = migrationStagingChangeGr.getValue('field');
            var fieldValue = migrationStagingChangeGr.getValue('new_value');

            if (fieldValue != null && fieldValue.startsWith('sn_aisearch_global_job_staging_')) {
                fieldValue = this.utils._lookupSysID(fieldValue, this.sysIDLookup, this.logger);

                if (fieldValue == null) {
                    this.logger.warn("Expected to find a lookup for " + migrationStagingChangeGr.getValue('new_value'));
                }
            }
            previousValues[fieldName] = migrationStagingChangeGr.getValue('previous_value');

            changes = changes + fieldName + ":" + fieldValue + " ";
            destinationGr.addQuery(fieldName, fieldValue);
        }
        destinationGr.setLimit(1);
        destinationGr.query();

        if (!destinationGr.hasNext()) {
            this.logger.warn("Unable to find record that matches. Either the record does not exist or has been changed since commit.");
            return null;
        }
        destinationGr.next();

        for (var key in previousValues) {
            destinationGr.setValue(key, previousValues[key]);
        }

        this.logger.info("Updating record => " + changes);
        destinationGr.update();
    },

    _removeIndexHistoryRecords: function() {
        var gr = new GlideRecord('sn_aisearch_global_job_ingest_history');
        gr.addQuery('sn_aisearch_global_migration_job', this.migrationSysID);
        gr.query();
        gr.deleteMultiple();
    },

    _publishProfile: function() {
        var jobGr = new GlideRecord('sn_aisearch_global_migration_job');
        if (jobGr.get(this.migrationSysID)) {
            var aisAppGr = new AISMigrationUtils().getSearchProfilesToPublish(jobGr.selected_config);
            if (aisAppGr != null && aisAppGr.search_profile.state != 'PUBLISHED') {
                var profile = aisAppGr.search_profile.name;
                var dictionaries = new AISMigrationUtils().getDictionariesToPublish(aisAppGr.search_profile);
                for (var i = 0; i < dictionaries.length; i++)
                    new sn_ais.Synchronizer().publishDictionary(dictionaries[i]);

                new sn_ais.Synchronizer().publishProfile(profile);
            }
        }
    },

    type: 'AisMigrationReverter'
};

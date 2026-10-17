var AisMigrationCommitter = Class.create();
AisMigrationCommitter.prototype = {

    initialize: function(migrationSysID) {
        this.logger = new sn_aisearch_global.AisMigrationLogger(migrationSysID, 'Committer');
        this.sysIDLookup = {};
        this.migrationSysID = migrationSysID;
    },

    commitAll: function() {
        this.logger.info("Start committing staged records");
        this._commitStagedRecords();
    },

    _commitStagedRecords: function() {
        var migrationStagingGr = new GlideRecord('sn_aisearch_global_job_staging');
        migrationStagingGr.addQuery('state', 'accept');
        migrationStagingGr.addQuery('migration_orchestration', this.migrationSysID);
        migrationStagingGr.orderBy('sequence');
        migrationStagingGr.query();

        while (migrationStagingGr.next()) {
            var destinationTable = migrationStagingGr.getValue('table_name');
            var operation = migrationStagingGr.getValue('operation');

            this.logger.info("Commit staged records for table: " + destinationTable);

            var migrationStagingChangeGr = new GlideRecord('sn_aisearch_global_job_staging_change');
            migrationStagingChangeGr.addQuery('migration_staging_record', migrationStagingGr.getUniqueValue());
            migrationStagingChangeGr.query();

            if (operation == 'insert') {
                var sysIDOfDestinationRecord = this._insertChanges(migrationStagingChangeGr, destinationTable);
                this.sysIDLookup['sn_aisearch_global_job_staging_' + migrationStagingGr.getUniqueValue()] = sysIDOfDestinationRecord;

                migrationStagingGr.table_sys_id = sysIDOfDestinationRecord;
                migrationStagingGr.update();

                this._updateMigrationCompletionRecords(migrationStagingGr.getUniqueValue(), sysIDOfDestinationRecord);
            } else
                this._updateChanges(migrationStagingChangeGr, destinationTable, migrationStagingGr.getValue('table_sys_id'));
        }

    },

    _insertChanges: function(migrationStagingChangeGr, destinationTable) {
        var msg = "Insert record into table : " + destinationTable + " : ";
        var destinationGr = new GlideRecord(destinationTable);
        destinationGr.initialize();
        msg = 'Values: ' + this._populateRecord(migrationStagingChangeGr, destinationGr);
        this.logger.info(msg);

        //Handle dot_walk_fields type index source attributes
        if (destinationTable == 'ais_datasource_field_attribute' && destinationGr.attribute == '2d45349173101010170b56b80ff6a7c8') {
            var fieldAttr = new GlideRecord(destinationTable);
            fieldAttr.addQuery('datasource', destinationGr.datasource);
            fieldAttr.addQuery('attribute', destinationGr.attribute);
            fieldAttr.addQuery('field', destinationGr.field);
            fieldAttr.query();
            if (fieldAttr.next()) {
                var arr = fieldAttr.getValue('value').toString().split(',');
                if (arr.indexOf(destinationGr.getValue('value')) < 0) {
                    fieldAttr.value = fieldAttr.value + ',' + destinationGr.value;
                    fieldAttr.update();
                }
                return fieldAttr.sys_id;
            }
            return destinationGr.insert();
        }
        return destinationGr.insert();
    },

    _updateChanges: function(migrationStagingChangeGr, destinationTable, destinationSysID) {
        var msg = "Update record table : " + destinationTable + " sys_id : " + destinationSysID + " : ";
        var destinationGr = new GlideRecord(destinationTable);

        if (destinationSysID != null && destinationSysID.startsWith('sn_aisearch_global_job_staging_')) {

            if (this.sysIDLookup[destinationSysID] == null) {
                this.logger.info(msg);
                this.logger.error("Error in update. Expected to find a lookup for " + destinationSysID);
                return;
            }

            destinationSysID = this.sysIDLookup[destinationSysID];
        }
        if (!destinationGr.get(destinationSysID)) {
            this.logger.error("Update failed. Unable to find record with sys_id: " + destinationSysID + " in table: " + destinationTable);
            return;
        }

        msg = 'Values: ' + this._populateRecord(migrationStagingChangeGr, destinationGr);
        this.logger.info(msg);
        destinationGr.update();
    },

    _populateRecord: function(migrationStagingChangeGr, destinationGr) {
        var msg = "";

        while (migrationStagingChangeGr.next()) {
            var fieldName = migrationStagingChangeGr.getValue('field');
            var fieldValue = migrationStagingChangeGr.getValue('new_value');

            if (fieldValue != null && fieldValue.startsWith('sn_aisearch_global_job_staging_')) {
                fieldValue = this.sysIDLookup[fieldValue];

                if (fieldValue == null) {
                    this.logger.error("Error in insert. Expected to find a lookup for " + migrationStagingChangeGr.getValue('new_value'));
                    return;
                }

            }

            destinationGr.setValue(fieldName, fieldValue);
            msg = msg + " field: " + fieldName + " value: " + fieldValue + "\n";
        }
        return msg;
    },

    _updateMigrationCompletionRecords: function(stagingRecordSysID, destinationRecordID) {
        var completionGr = new GlideRecord('sn_aisearch_global_job_completion');
        completionGr.addQuery('destination_sys_id', 'sn_aisearch_global_job_staging_' + stagingRecordSysID);
        completionGr.query();

        while (completionGr.next()) {
            completionGr.setValue('destination_sys_id', destinationRecordID);
            completionGr.update();
        }
    },

    type: 'AisMigrationCommitter'
};

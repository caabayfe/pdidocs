var AisMigrationRecord = Class.create();
AisMigrationRecord.prototype = {

    initialize: function(migrationSysID, targetTableName) {
        if (!targetTableName)
            throw 'Cannot create a record without table name';

        if (!migrationSysID)
            throw 'Cannot create a record without migrationSysID';

        this.targetTableName = targetTableName;
        this.migrationSysID = migrationSysID;
        this.queries = [];
        this.setValues = {};
        this.conflictResolver = new AisMigrationConflictResolver(migrationSysID);
    },

    setNeedsReview: function(needsReview) {
        this.needsReview = needsReview;
    },

    addQuery: function(key, operator, value) {
        var query = {
            key: key,
            operator: operator,
            value: value
        };
        this.queries.push(query);
    },

    query: function() {
        this.targetGr = new GlideRecord(this.targetTableName);
        for (var i = 0; i < this.queries.length; i++) {
            var query = this.queries[i];
            this.targetGr.addQuery(query.key, query.operator, query.value);
        }

        this.targetGr.query();
    },

    setValue: function(key, value) {
        this.setValues[key] = value;
    },

    insert: function() {
        // Indexed sources are special. We cannot insert more than one per table.
        if (this.targetTableName === 'ais_datasource') {
            var existingStagingGr = this._isIndexedSourceStaged(this.setValues['source']);
            if (this._indexedSourceExists(this.setValues['source']) && existingStagingGr != null) {
                this.conflictResolver.resolveWithStagingRecord(this.targetTableName, existingStagingGr, this.setValues);

                this.setValues = {};
                return 'sn_aisearch_global_job_staging_' + existingStagingGr.getUniqueValue();
            }
        }

        var stagingGr = new GlideRecord('sn_aisearch_global_job_staging');
        stagingGr.initialize();
        stagingGr.setValue('table_name', this.targetTableName);
        stagingGr.setValue('operation', 'insert');
        stagingGr.setValue('migration_orchestration', this.migrationSysID);
        if (this.needsReview)
            stagingGr.setValue('state', 'needs_review');

        var stagingRecordSysID = stagingGr.insert();
        var values = this.setValues;
        Object.keys(values).forEach(function(key) {
            var value = values[key];

            var stagingChangeGr = new GlideRecord('sn_aisearch_global_job_staging_change');
            stagingChangeGr.initialize();
            stagingChangeGr.setValue('migration_staging_record', stagingRecordSysID);
            stagingChangeGr.setValue('field', key);
            stagingChangeGr.setValue('new_value', value);
            stagingChangeGr.insert();
        });

        this.setValues = {};
        return 'sn_aisearch_global_job_staging_' + stagingRecordSysID; // A special prefix to help us identify generated records
    },

    update: function() {
        // Indexed sources are special. We cannot insert more than one per table.
        if (this.targetTableName === 'ais_datasource') {
            var existingStagingGr = this._isIndexedSourceStaged(this.setValues['source']);
            if (existingStagingGr != null) {
                this.conflictResolver.resolveWithStagingRecord(this.targetTableName, existingStagingGr, this.setValues);
                this.setValues = {};
                return;
            }
        }

        var stagingGr = new GlideRecord('sn_aisearch_global_job_staging');
        stagingGr.initialize();
        if (this.needsReview)
            stagingGr.setValue('state', 'needs_review');

        stagingGr.setValue('table_name', this.targetTableName);

        stagingGr.setValue('table_sys_id', this.targetGr.getUniqueValue());
        stagingGr.setValue('operation', 'update');

        stagingGr.setValue('migration_orchestration', this.migrationSysID);

        var stagingRecordSysID = stagingGr.insert();
        var insertedChanges = 0;

        var values = this.setValues;
        var targetGr = this.targetGr;
        Object.keys(values).forEach(function(key) {
            var value = values[key];

            var stagingChangeGr = new GlideRecord('sn_aisearch_global_job_staging_change');
            stagingChangeGr.initialize();
            stagingChangeGr.setValue('migration_staging_record', stagingRecordSysID);
            stagingChangeGr.setValue('field', key);
            stagingChangeGr.setValue('previous_value', targetGr.getValue(key));
            stagingChangeGr.setValue('new_value', value);
            stagingChangeGr.insert();

            insertedChanges = insertedChanges + 1;
        });

        // In case of no changes, remove the staging record
        if (insertedChanges === 0) {
            gs.info('No changes found for the record. Deleting staged record.');
            stagingGr.get(stagingRecordSysID);
            stagingGr.deleteRecord();
            return;
        }

        this.setValues = {};
    },

    next: function() {
        this.setValues = {};
        return this.targetGr.next();
    },

    hasNext: function() {
        return this.targetGr.hasNext();
    },

    getValue: function(fieldName) {
        return this.targetGr.getValue(fieldName);
    },

    getUniqueValue: function() {
        return this.targetGr.getUniqueValue();
    },

    get: function(sysID) {
        this.addQuery('sys_id', '=', sysID);
        this.query();
        this.next();
    },

    _isIndexedSourceStaged: function(tableName) {
        var stagingChangeGr = new GlideRecord('sn_aisearch_global_job_staging_change');
        stagingChangeGr.addQuery('field', 'source');

        stagingChangeGr.addQuery('new_value', tableName);
        stagingChangeGr.addQuery('migration_staging_record.table_name', 'ais_datasource');
        stagingChangeGr.orderByDesc('migration_staging_record.sequence');
        stagingChangeGr.query();

        if (!stagingChangeGr.next()) {
            gs.info("Found no staging record for table_name" + tableName);
            return null;
        }

        gs.info("Found an existing staging record for table_name" + tableName);
        var stagingGr = new GlideRecord('sn_aisearch_global_job_staging');
        stagingGr.get(stagingChangeGr.getValue('migration_staging_record'));
        return stagingGr;

    },

    _indexedSourceExists: function(tableName) {
        var indexedSourceGR = new GlideRecord('ais_datasource');
        indexedSourceGR.addQuery('source', tableName);
        indexedSourceGR.query();
        if (indexedSourceGR.next())
            return true;

        return false;
    },
    type: 'AisMigrationRecord'
};

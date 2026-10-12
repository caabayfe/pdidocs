var AisMigrationConflictResolver = Class.create();
AisMigrationConflictResolver.prototype = {
    initialize: function(migrationSysID) {
        this.migrationSysID = migrationSysID;
        this.logger = new AisMigrationLogger(migrationSysID, 'ConflictResolver');
    },

    /**
    Child indexed sources cannot have filters in AI Search. These need to be resolved manually by users
	
	This method does some simple checks to see if it can be avoided.
	 **/
    resolveChildIndexedSource: function(aisChildGR, zingSourceGR) {

        var parentDataSource = aisChildGR.getValue('datasource');
        var parentDataSourceGr = new GlideRecord('ais_datasource');
        parentDataSourceGr.get(parentDataSource);
        var targetTable = parentDataSourceGr.getValue('source');

        var existingCondition = parentDataSourceGr.getValue('filter');
        var sourceTable = zingSourceGR.getValue('source_table');
        var incomingCondition = '';
        if (sourceTable)
            incomingCondition = new global.TSConfigurationUtil().getTableLevelAttribute(sourceTable, 'text_index_filter_query');

        if (existingCondition == incomingCondition) {
            this.logger.info('Conditions are the same. Skipping ');
            return;
        }

        if (incomingCondition != null && existingCondition != null) {
            this.logger.error('Table: ' + aisChildGR.getValue('table') + ' is a child table on Indexed Source: ' + targetTable +
                '. Please manually resolve the filter conditions for Zing search source: ' + zingSourceGR.name);
            return;
        }

    },

    /**
    Handles the case where the migrated source conflicts with an existing indexed source on the instance.

	 **/
    resolveIndexedSource: function(datasourceGr, zingSourceGr) {
        var targetSource = datasourceGr.getValue('source');
        var existingCondition = datasourceGr.getValue('filter');
        var sourceTable = zingSourceGr.getValue('source_table');
        var incomingCondition = '';
        if (sourceTable)
            incomingCondition = new global.TSConfigurationUtil().getTableLevelAttribute(sourceTable, 'text_index_filter_query');

        // Legacy records could have a filter defined as an attribute instead of the condition field on the table
        if (existingCondition == null || existingCondition == '')
            existingCondition = new sn_ais.AisUtil().getTableLevelAttribute(targetSource, 'filter', '');

        var finalCondition = this._resolveCondition(existingCondition, incomingCondition);

        this.logger.warn("Resolved condition conflicts for table: " + targetSource + " . Result of condition merge: " + finalCondition);

        var stagingGr = new AisMigrationRecord(this.migrationSysID, 'ais_datasource');
        stagingGr.setNeedsReview(true);

        stagingGr.addQuery('source', '=', targetSource);
        stagingGr.query();
        stagingGr.next();

        stagingGr.setValue('source', targetSource);
        stagingGr.setValue('filter', finalCondition);
        stagingGr.update();

    },

    /**
    Handles the case where the record we are about to migrate conflicts with a record we have staged. In this case, the 'previous_value'
    for the record should come from the staged record, assuming it will be committed first.
	
	We will copy all values over from the previously staged record, and only overwrite the values we need to
	 **/
    resolveWithStagingRecord: function(targetTableName, existingStagingRecord, values) {
        var targetSysID = existingStagingRecord.getValue('table_sys_id');
        if (targetSysID == null || targetSysID == '')
            targetSysID = 'sn_aisearch_global_job_staging_' + existingStagingRecord.getUniqueValue();

        var stagingGr = new GlideRecord('sn_aisearch_global_job_staging');
        stagingGr.initialize();
        stagingGr.setValue('state', 'needs_review');

        stagingGr.setValue('table_name', targetTableName);
        stagingGr.setValue('table_sys_id', targetSysID);
        stagingGr.setValue('operation', 'update');
        stagingGr.setValue('migration_orchestration', this.migrationSysID);

        var stagingRecordSysID = stagingGr.insert();
        var insertedChanges = 0;

        var existingChangeGr = new GlideRecord('sn_aisearch_global_job_staging_change');
        existingChangeGr.addQuery('migration_staging_record', existingStagingRecord.getUniqueValue());
        existingChangeGr.query();

        while (existingChangeGr.next()) {
            var key = existingChangeGr.getValue('field');
            var existingValue = existingChangeGr.getValue('new_value');
            var incomingValue = values[key];
            var finalValue;

            if (key == 'filter') {
                finalValue = this._resolveCondition(existingValue, incomingValue);
                this.logger.warn("Resolved staged condition conflicts for table: " + targetTableName + " . Result of condition merge: " + finalValue);
            } else if (incomingValue == null)
                finalValue = existingValue;
            else
                finalValue = incomingValue;

            var stagingChangeGr = new GlideRecord('sn_aisearch_global_job_staging_change');
            stagingChangeGr.initialize();
            stagingChangeGr.setValue('migration_staging_record', stagingRecordSysID);
            stagingChangeGr.setValue('field', key);
            stagingChangeGr.setValue('previous_value', existingValue);
            stagingChangeGr.setValue('new_value', finalValue);
            stagingChangeGr.insert();

            insertedChanges = insertedChanges + 1;
        }

        // In case of no changes, remove the staging record
        if (insertedChanges == 0) {
            gs.info('No changes found for the record. Deleting staged record.');
            stagingGr.get(stagingRecordSysID);
            stagingGr.deleteRecord();
        }

        this.setValues = {};

    },

    /**
    Resolves conditions by joining them with a new query (^NQ) operator, which translates roughly to an OR
    
    We are severely limited by the APIs exposed to scoped apps. Hence we can only perform primitive string operations on the conditions we see
	 **/
    _resolveCondition: function(existingCondition, incomingCondition) {
        if (existingCondition != null)
            existingCondition = existingCondition.trim();

        if (incomingCondition != null)
            incomingCondition = incomingCondition.trim();
        this.logger.info('Resolving conditions: existing: ' + existingCondition + ' incoming: ' + incomingCondition);

        // If either of the conditions are empty or null, then there are no filters. Need to index all content.
        if (existingCondition == null || existingCondition == '')
            return null;

        if (incomingCondition == null || incomingCondition == '')
            return null;

        // Check if either condition contains the other
        if (this._doesFirstConditionContainSecond(existingCondition, incomingCondition))
            return existingCondition;
        if (this._doesFirstConditionContainSecond(incomingCondition, existingCondition))
            return incomingCondition;

        return existingCondition + '^NQ' + incomingCondition;
    },

    _doesFirstConditionContainSecond: function(firstCondition, secondCondition) {
        if (firstCondition == secondCondition)
            return true;

        if (firstCondition == null || !firstCondition.includes('^NQ'))
            return false;

        var subConditions = firstCondition.split('^NQ');
        for (var i in subConditions) {
            var condition = subConditions[i];
            if (condition.trim() == secondCondition.trim())
                return true;
        }

        return false;
    },



    type: 'AisMigrationConflictResolver'
};

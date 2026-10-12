var DataPatternMigrationScript = Class.create();
DataPatternMigrationScript.prototype = {
    SOURCE_DATA_PATTERN_TABLE: 'sn_data_discovery_data_pattern',
    TARGET_DATA_PATTERN_TABLE: 'dp_data_pattern',
    PRODUCTION_ACTION_HISTORY_CORRELATION_ID: new DataProtectionCorrelationGenerator().getCorrelationId('DPM'),
    PRODUCTION_ACTION_HISTORY_FEATURE_NAME: 'Data Pattern Migration',
    PRODUCTION_ACTION_HISTORY_STATUS_TYPE_COMPLETE: 'MIGRATION_COMPLETE',
    PRODUCTION_ACTION_HISTORY_STATUS_TYPE_PARTIAL: 'MIGRATION_PARTIAL_COMPLETE',
    PRODUCTION_ACTION_HISTORY_STATUS_TYPE_ERROR: 'MIGRATION_ERROR',
    FIELD_EXPRESSION: 'expression',
    FIELD_INTERNAL_SCOPE: 'internal_scope',
    FIELD_OUT_OF_THE_BOX: 'out_of_the_box',
    FIELD_SYS_ID: 'sys_id',
    FIELD_NAME: 'name',
    KEY_FIELD_NAME: 'name',
    KEY_FIELD_TYPE: 'type',
    KEY_DEPENDENT_TABLE_FIELD: 'dependent_table_field',
    KEY_SOURCE_RECORD_COUNT: 'sourceRecordCount',
    KEY_MIGRATED_RECORD_COUNT: 'migratedRecordCount',
    KEY_MIGRATION_DETAILS: 'migrationDetails',
    KEY_AUDIT_DATA_PATTERN_RECORDS: 'dataPatternRecords',
    KEY_AUDIT_DATA_PATTERN_REFERENCES: 'dataPatternReferences',
    KEY_AUDIT_DATA_PATTERN_MAPPING: 'dataPatternMapping',
    SOURCE_DATA_PATTERN_ID_LIST: [],
    MIGRATION_TYPE_UPDATE: 'update',
    MIGRATION_TYPE_CREATE: 'create',
    DATA_PATTERN_FIELDS: ['sys_id', 'sys_scope', 'internal_scope', 'name', 'description', 'type', 'expression', 'out_of_the_box', 'keyword', 'synthetic_value', 'keyword_proximity'],
    DATA_PATTERN_FIELD_SOURCE_SYS_ID: 'source_sys_id',
    DATA_PATTERN_OOB_EXCLUDE_FIELDS: ['sys_id', 'sys_scope', 'internal_scope'],
    DATA_PATTERN_NON_OOB_EXCLUDE_FIELDS: ['sys_id'],
    MIGRATION_AUDIT: {
        'dataPatternMapping': {},
        'dataPatternRecords': {
            'sourceRecordCount': 0,
            'migratedRecordCount': 0,
            'migrationDetails': []
        },
        'dataPatternReferences': {}
    },
    DATA_PATTERN_REFERENCE_FIELD_DETAILS: {
        'dp_m2m_configuration_pattern': [{
            'name': 'data_pattern',
            'type': 'reference'
        }],
        'dp_m2m_configuration_pattern_global': [{
            'name': 'data_pattern',
            'type': 'reference',
            'dependent_table_field': 'data_pattern_table'
        }],
        'sn_data_discovery_active_data_pattern': [{
            'name': 'data_pattern',
            'type': 'reference'
        }],
        'sn_data_discovery_policy': [{
            'name': 'data_patterns',
            'type': 'glidelist'
        }],
		'sn_data_discovery_granular_finding': [{
            'name': 'data_patterns',
            'type': 'glidelist'
        }],
        'sn_data_discovery_target_table_history': [{
            'name': 'data_pattern',
            'type': 'reference'
        }],
        'sn_data_discovery_finding': [{
            'name': 'data_pattern',
            'type': 'reference'
        }],
		'sn_data_discovery_asset_control': [{
            'name': 'data_pattern',
            'type': 'reference'
        }]
    },
    initialize: function() {},
    /**
     * Migrates data patterns from data pattern table in discovery store app to associated table in data privacy core plugin. Additionally, also updates the references in all tables across data privacy plugin and data discovery store app, having references to data pattern. 
     * 
     * Source data pattern table for migration: sn_data_discovery_data_pattern
     * Target data pattern table for migration: dp_data_pattern
     */
    start: function() {
        try {
            if (!this._validateDataPatternTables())
                return;
            this._loadSourceDataPatternIds();
            this._migrateDataPatternRecords();
            this._migrateDataPatternReferences();
            this._createProductActionHistory();
        } catch (err) {
            gs.error('Failed to migrate data pattern records: ' + err)
        }
    },
    /**
     * Validates that both source and target data pattern tables exist
     * @returns true if both tables exist, false otherwise
     */
    _validateDataPatternTables: function() {
        var dataPatternTables = [this.SOURCE_DATA_PATTERN_TABLE, this.TARGET_DATA_PATTERN_TABLE];
        for (var i = 0; i < dataPatternTables.length; i++) {
            if (!this._tableExists(dataPatternTables[i])) {
                gs.info(`Skipping data pattern migration: table ${dataPatternTables[i]} does not exist.`);
                return false;
            }
        }
        return true;
    },
    /**
     * Loads a list with data pattern sysIds from the sn_data_discovery_data_pattern (source) data pattern table
     */
    _loadSourceDataPatternIds: function() {
        var sourceDataPatternGr = new GlideRecord(this.SOURCE_DATA_PATTERN_TABLE);
        sourceDataPatternGr.query();
        while (sourceDataPatternGr.next())
            this.SOURCE_DATA_PATTERN_ID_LIST.push(sourceDataPatternGr.getUniqueValue());
    },
    /**
     * Copies data pattern records from sn_data_discovery_data_pattern (source) table to dp_data_pattern (target) table.
     * For OOB records, any customer modifications are updated in target table
     * Custom patterns are created in the target table
     */
    _migrateDataPatternRecords: function() {
        gs.info(`Starting migration of data patterns from ${this.SOURCE_DATA_PATTERN_TABLE} to ${this.TARGET_DATA_PATTERN_TABLE}`);
        this._migrateOutOfTheBoxPatterns();
        this._migrateCustomPatterns();
        gs.info(`Completed migration of data patterns from ${this.SOURCE_DATA_PATTERN_TABLE} to ${this.TARGET_DATA_PATTERN_TABLE}`);
    },
    /**
     * Updates the OOB data pattern records in the dp_data_pattern (target) table with any customer customizations from sn_data_discovery_data_pattern (source) table
     */
    _migrateOutOfTheBoxPatterns: function() {
        gs.info(`Starting migration of OOB data patterns from ${this.SOURCE_DATA_PATTERN_TABLE} to ${this.TARGET_DATA_PATTERN_TABLE}`);

        var dataPatternDetails = this._getDataPatternDetails(this.SOURCE_DATA_PATTERN_TABLE, true);
        var targetDataPatternGr = this._getDataPatternGr(this.TARGET_DATA_PATTERN_TABLE, true);

        var patternCount = this._getSourcePatternCount(true);
        var migratedPatternCount = 0;

        while (targetDataPatternGr.next()) {
            var key = this._createDataPatternKey(targetDataPatternGr, true);

            if (!(key in dataPatternDetails)) {
                gs.info(`OOB data pattern ${targetDataPatternGr.getValue(this.FIELD_NAME)} with sys_id ${targetDataPatternGr.getValue(this.FIELD_SYS_ID)} found in ${this.TARGET_DATA_PATTERN_TABLE} but does not exist in ${this.SOURCE_DATA_PATTERN_TABLE}`);
                continue;
            }

            var fieldValueMap = dataPatternDetails[key];
            var sourceDataPatternId = fieldValueMap[this.FIELD_SYS_ID];
            var targetDataPatternId = targetDataPatternGr.getUniqueValue();

            var updateRequired = this._setValuesInGr(targetDataPatternGr, fieldValueMap, this.DATA_PATTERN_OOB_EXCLUDE_FIELDS);
            var updateResult = !updateRequired || targetDataPatternGr.update();
            var error = updateResult ? '' : `Failed to update data pattern ${targetDataPatternId} in ${this.TARGET_DATA_PATTERN_TABLE}`;

            this._auditDataPatternMigration(sourceDataPatternId, targetDataPatternId, this.MIGRATION_TYPE_UPDATE, updateRequired, updateResult, error);
            if (updateResult)
                migratedPatternCount++;
        }

        gs.info(`Completed migration of ${migratedPatternCount}/${patternCount} OOB data patterns from ${this.SOURCE_DATA_PATTERN_TABLE} to ${this.TARGET_DATA_PATTERN_TABLE}`);
    },
    /**
     * Creates all custom patterns from sn_data_discovery_data_pattern (source) table in dp_data_pattern (target) table
     */
    _migrateCustomPatterns: function() {
        gs.info(`Starting migration of custom data patterns from ${this.SOURCE_DATA_PATTERN_TABLE} to ${this.TARGET_DATA_PATTERN_TABLE}`);

        var dataPatternDetails = this._getDataPatternDetails(this.SOURCE_DATA_PATTERN_TABLE, false);
        var targetDataPatternGr = new GlideRecord(this.TARGET_DATA_PATTERN_TABLE);

        var patternCount = this._getSourcePatternCount(true);
        var migratedPatternCount = 0;

        for (var key in dataPatternDetails) {
            var fieldValueMap = dataPatternDetails[key];
            var sourceDataPatternId = fieldValueMap[this.FIELD_SYS_ID];

            targetDataPatternGr.initialize();
            this._setValuesInGr(targetDataPatternGr, fieldValueMap, this.DATA_PATTERN_NON_OOB_EXCLUDE_FIELDS);
            targetDataPatternGr.setWorkflow(false);
            var targetDataPatternId = targetDataPatternGr.insert();
            var insertResult = !gs.nil(targetDataPatternId);

            var error = insertResult ? '' : `Failed to insert data pattern in ${this.TARGET_DATA_PATTERN_TABLE} for data pattern ${sourceDataPatternId} from ${this.SOURCE_DATA_PATTERN_TABLE}`;
            this._auditDataPatternMigration(sourceDataPatternId, targetDataPatternId, this.MIGRATION_TYPE_CREATE, insertResult, insertResult, error);

            if (insertResult)
                migratedPatternCount++;
        }

        gs.info(`Completed migration of ${migratedPatternCount}/${patternCount} custom data patterns from ${this.SOURCE_DATA_PATTERN_TABLE} to ${this.TARGET_DATA_PATTERN_TABLE}`);
    },
    /**
     * Updates the reference record sysIds from source data pattern record sysId to target data pattern record sysId, in all tables that have a reference field to the data pattern table.
     * 
     * Note: This does not update the dictionary entry, but updates the records of the table with sysIds from the dp_data_pattern (target) table.
     */
    _migrateDataPatternReferences: function() {
        for (var table in this.DATA_PATTERN_REFERENCE_FIELD_DETAILS) {
            var isValidTable = this._tableExists(table);
            var referenceFieldDetails = this.DATA_PATTERN_REFERENCE_FIELD_DETAILS[table];
            for (var i = 0; i < referenceFieldDetails.length; i++) {
                var curFieldDetails = referenceFieldDetails[i];
                var referenceFieldType = curFieldDetails[this.KEY_FIELD_TYPE];
                var referenceFieldName = curFieldDetails[this.KEY_FIELD_NAME]
                gs.info(`Migrating data pattern references in ${table}.${referenceFieldName}`)
                if (!isValidTable) {
                    var errorMsg = `Table does not exist: ${table}`;
                    gs.error(`Failed to migrating data pattern references in ${table}.${referenceFieldName}: ${errorMsg}`);
                    this._auditReferenceMigration(table, referenceFieldName, -1, -1, errorMsg);
                    continue;
                }
                if (referenceFieldType == 'reference')
                    this._updateReferenceField(table, curFieldDetails);
                else if (referenceFieldType == 'glidelist')
                    this._updateGlideListField(table, curFieldDetails);
            }
        }
    },
    /**
     * Updates the fields of type 'reference' in tables referencing data pattern table.
     * 
     * Iterates over the data pattern mapping and does a batch update of all records with reference to same data pattern. In case of a dependent field (such as in dp_m2m_configuration_pattern_global), also updates the column specifying data pattern table with the new table name.
     * 
     * Uses GlideRecord#queryNoDomain and GlideRecord#updateNoDomain apis to ensure references within domain separated tables within privacy are safely updated.
     */
    _updateReferenceField: function(table, fieldDetails) {
        var fieldName = fieldDetails[this.KEY_FIELD_NAME];
        var dependentField = this.KEY_DEPENDENT_TABLE_FIELD in fieldDetails ? fieldDetails[this.KEY_DEPENDENT_TABLE_FIELD] : '';
        var sourceReferenceCountBefore = this._getSourcePatternReferenceCount(table, fieldName);
        var dataPatternMapping = this._getDataPatternMapping();
        for (var sourceDataPatternId in dataPatternMapping) {
            var targetDataPatternId = dataPatternMapping[sourceDataPatternId];
            if (gs.nil(targetDataPatternId))
                continue;
            var tableGr = new GlideRecord(table);
            tableGr.addQuery(fieldName, sourceDataPatternId);
            tableGr.queryNoDomain();
            while (tableGr.next()) {
                tableGr.setValue(fieldName, targetDataPatternId);
                if (!gs.nil(dependentField))
                    tableGr.setValue(dependentField, this.TARGET_DATA_PATTERN_TABLE);
                tableGr.updateNoDomain();
            }
        }
        var sourceReferenceCountAfter = this._getSourcePatternReferenceCount(table, fieldName);
        var errorMsg = sourceReferenceCountAfter == 0 ? '' : `Failed to update references for ${sourceReferenceCountAfter} records.`;
        this._auditReferenceMigration(table, fieldName, sourceReferenceCountBefore, sourceReferenceCountAfter, errorMsg);
    },
    /**
     * Updates the fields of type 'glidelist' with reference to data pattern table.
     * 
     * Since each record may have 1 or more patterns, the update is done record by record where all patterns in the record are updated to their new references. In case of a dependent field (such as in dp_m2m_configuration_pattern_global), also updates the column specifying data pattern table with the new table name.
     * 
     * Uses GlideRecord#queryNoDomain and GlideRecord#updateNoDomain apis to ensure references within domain separated tables within privacy are safely updated.
     */
    _updateGlideListField: function(table, fieldDetails) {
        var fieldName = fieldDetails[this.KEY_FIELD_NAME];
        var dependentField = this.KEY_DEPENDENT_TABLE_FIELD in fieldDetails ? fieldDetails[this.KEY_DEPENDENT_TABLE_FIELD] : '';
        var failedUpdateRecordIds = [];
        var tableGr = new GlideRecord(table);
        tableGr.queryNoDomain();
        var sourceReferenceCountBefore = tableGr.getRowCount();
        var dataPatternMapping = this._getDataPatternMapping();
        while (tableGr.next()) {
            var sourceDataPatternIds = gs.nil(tableGr.getValue(fieldName)) ? [] : tableGr.getValue(fieldName).split(',');
            var targetDataPatternIds = [];
            var shouldUpdate = true;

            for (var i = 0; i < sourceDataPatternIds.length; i++) {
                var targetPatternId = dataPatternMapping[sourceDataPatternIds[i]];
                if (gs.nil(targetPatternId)) {
                    shouldUpdate = false;
                    break;
                }
                targetDataPatternIds.push(targetPatternId);
            }

            if (shouldUpdate && targetDataPatternIds.length > 0) {
                tableGr.setValue(fieldName, targetDataPatternIds.join(','));
                if (!gs.nil(dependentField))
                    tableGr.setValue(dependentField, this.TARGET_DATA_PATTERN_TABLE);
            }

            if (!shouldUpdate || !tableGr.updateNoDomain())
                failedUpdateRecordIds.push(tableGr.getUniqueValue());
        }
        var sourceReferenceCountAfter = failedUpdateRecordIds.length;
        var errorMsg = sourceReferenceCountAfter == 0 ? '' : `Failed to update references for ${sourceReferenceCountAfter} records.`;
        this._auditReferenceMigration(table, fieldName, sourceReferenceCountBefore, sourceReferenceCountAfter, errorMsg);

    },
    /**
     * Fetch the details of data pattern records as a json object.
     * 
     * @param {string} dataPatternTable name of the data pattern table
     * @param {boolean} outOfTheBox true if out of the box patterns need to be fetched, false otherwise.
     * @returns Map with one key-value pair per data pattern record. The value will have all the column values for the record.
     */
    _getDataPatternDetails: function(dataPatternTable, outOfTheBox) {
        var gr = this._getDataPatternGr(dataPatternTable, outOfTheBox);

        var dataPatternDetails = {};

        while (gr.next()) {
            var key = this._createDataPatternKey(gr, outOfTheBox);
            var details = {};
            for (var i = 0; i < this.DATA_PATTERN_FIELDS.length; i++) {
                var fieldName = this.DATA_PATTERN_FIELDS[i];
                if (gr.isValidField(fieldName))
                    details[fieldName] = gr.getValue(fieldName);
            }
            details[this.DATA_PATTERN_FIELD_SOURCE_SYS_ID] = gr.getUniqueValue();
            dataPatternDetails[key] = details;
        }
        return dataPatternDetails;
    },
    /**
     * Fetch the records from a data pattern table.
     * 
     * @param {string} dataPatternTable name of the data pattern table
     * @param {boolean} outOfTheBox true if out of the box patterns need to be fetched, false otherwise.
     * @returns GlideRecord of the data pattern table filtered based on the outOfTheBox parameter.
     */
    _getDataPatternGr: function(dataPatternTable, outOfTheBox) {
        var gr = new GlideRecord(dataPatternTable);
        gr.addQuery(this.FIELD_OUT_OF_THE_BOX, outOfTheBox);
        gr.query();
        return gr;
    },
    /**
     * Set the values in the glide record based on supplied field-value map
     * @param {GlideRecord} dataPatternGr Data pattern record
     * @param {Object} valuesMap a map of columnName-columnValue to be updated in the record.
     * @param {Array} excludeFields list of columnNames that should not be updated.
     * @returns boolean indicating if update of the record is required or not.
     */
    _setValuesInGr: function(dataPatternGr, valuesMap, excludeFields) {
        var updateRequired = false;
        for (var i = 0; i < this.DATA_PATTERN_FIELDS.length; i++) {
            var fieldName = this.DATA_PATTERN_FIELDS[i];
            if ((excludeFields && excludeFields.includes(fieldName)) || dataPatternGr.getValue(fieldName) == valuesMap[fieldName])
                continue;
            dataPatternGr.setValue(fieldName, valuesMap[fieldName]);
            updateRequired = true;
        }
        dataPatternGr.setValue(this.DATA_PATTERN_FIELD_SOURCE_SYS_ID, valuesMap[this.DATA_PATTERN_FIELD_SOURCE_SYS_ID]);
        return updateRequired;
    },
    /**
     * creates a unique key for the data pattern record 
     * @param {GlideRecord} dataPatternGr Data pattern record
     * @param {boolean} outOfTheBox true if out of the box patterns need to be fetched, false otherwise.
     * @returns unique key representing the data pattern record
     */
    _createDataPatternKey: function(dataPatternGr, outOfTheBox) {
        var expression = dataPatternGr.getValue(this.FIELD_EXPRESSION);
        var internalScope = dataPatternGr.getValue(this.FIELD_INTERNAL_SCOPE);
        return outOfTheBox ? expression : `${expression}~${internalScope}`;
    },
    /**
     * Audits the migration of data pattern record from sn_data_discovery_data_pattern (source) table to dp_data_pattern (target) table
     * @param {string} sourceDataPatternId sysId of the data pattern record from source table
     * @param {string} targetDataPatternId sysId of the data pattern record from target table
     * @param {string} migrationType Type of migration. Allowed values are create/update.
     * @param {boolean} valuesChanged boolean value indicating if values were changed in the target table
     * @param {boolean} migrationSuccess boolean value indicating if migration was done successfully.
     * @param {boolean} [optionalArg] message indicating any error during migration 
     */
    _auditDataPatternMigration: function(sourceDataPatternId, targetDataPatternId, migrationType, valuesChanged, migrationSuccess, error) {
        var dataPatternRecordsAudit = this.MIGRATION_AUDIT[this.KEY_AUDIT_DATA_PATTERN_RECORDS];
        dataPatternRecordsAudit[this.KEY_SOURCE_RECORD_COUNT]++;
        if (migrationSuccess) {
            dataPatternRecordsAudit[this.KEY_MIGRATED_RECORD_COUNT]++;
            this._mapMigration(sourceDataPatternId, targetDataPatternId);
        }

        dataPatternRecordsAudit[this.KEY_MIGRATION_DETAILS].push({
            'migrationType': migrationType,
            'success': migrationSuccess,
            'valuesChanged': valuesChanged,
            'sourceDataPatternId': sourceDataPatternId,
            'targetDataPatternId': targetDataPatternId,
            'error': migrationSuccess ? '' : error,
        });
    },
    /**
     * Audits the migration of data pattern references in a table from sysIds of sn_data_discovery_data_pattern (source) table to sysIds of dp_data_pattern (target) table
     * @param {string} table Name of the table where references were updated
     * @param {string} referenceField Name of the reference field
     * @param {integer} sourceReferenceCountBefore Number of records before migration that were referencing source table
     * @param {integer} sourceReferenceCountAfter Number of records after migration that were referencing source table
     */
    _auditReferenceMigration: function(table, referenceField, sourceReferenceCountBefore, sourceReferenceCountAfter, error) {
        var dataPatternReferencesAudit = this.MIGRATION_AUDIT[this.KEY_AUDIT_DATA_PATTERN_REFERENCES];
        if (!(table in dataPatternReferencesAudit))
            dataPatternReferencesAudit[table] = {};

        var migrationSuccess = sourceReferenceCountAfter == 0;
        dataPatternReferencesAudit[table][referenceField] = {
            'totalRecords': sourceReferenceCountBefore,
            'migratedRecords': sourceReferenceCountBefore - sourceReferenceCountAfter,
            'success': migrationSuccess,
            'error': error ? error : '',
        }
    },
    /**
     * Maps the record id of migrated data pattern from sn_data_discovery_data_pattern (source) table to dp_data_pattern (target) table
     * @param {string} sourceDataPatternId sysId of data pattern from source table
     * @param {string} targetDataPatternId sysId of data pattern from target table
     */
    _mapMigration: function(sourceDataPatternId, targetDataPatternId) {
        var dataPatternMapping = this.MIGRATION_AUDIT[this.KEY_AUDIT_DATA_PATTERN_MAPPING];
        dataPatternMapping[sourceDataPatternId] = targetDataPatternId;
    },
    /**
     * Fetch the mapping of data pattern record sysId from sn_data_discovery_data_pattern (source) table to dp_data_pattern (target) table
     * @returns Map of data pattern record sysId from source to target table.
     */
    _getDataPatternMapping: function() {
        return this.MIGRATION_AUDIT[this.KEY_AUDIT_DATA_PATTERN_MAPPING];
    },
    /**
     * Validates if the given table exists in the platform
     * @param {string} table name of the table
     * @returns true if the table exists, false otherwise
     */
    _tableExists: function(table) {
        return new TableUtils(table).tableExists();
    },
    /**
     * Fetch the number of records having references to records in source table
     * @param {string} table name of the table
     * @param {*} referenceField name of the field referencing sn_data_discovery_data_pattern (source) table
     * @returns integer value indicating number of records having references to records in source table
     */
    _getSourcePatternReferenceCount: function(table, referenceField) {
        var ga = new GlideAggregate(table);
        ga.addQuery(referenceField, 'IN', this.SOURCE_DATA_PATTERN_ID_LIST.join(','));
        ga.addAggregate('COUNT');
        ga.query();
        return ga.next() ? parseInt(ga.getAggregate('COUNT')) : 0;
    },
    /**
     * Fetch the number of data pattern records.
     * @param {boolean} outOfTheBox boolean value indicating if outOfTheBox patterns or custom patterns are to be counted.
     * @returns integer value indicating number of matching data pattern records.
     */
    _getSourcePatternCount: function(outOfTheBox) {
        var ga = new GlideAggregate(this.SOURCE_DATA_PATTERN_TABLE);
        ga.addQuery(this.FIELD_OUT_OF_THE_BOX, outOfTheBox);
        ga.addAggregate('COUNT');
        ga.query();
        return ga.next() ? parseInt(ga.getAggregate('COUNT')) : 0;
    },
    /**
     * Determine the status of migration. 
     * @returns status of migration. If all data pattern records are migrated: success, None migrated: Error, otherwise: Partial. 
     */
    _getMigrationStatus: function() {
        var dataPatternRecordsAudit = this.MIGRATION_AUDIT[this.KEY_AUDIT_DATA_PATTERN_RECORDS];
        var sourceRecordCount = dataPatternRecordsAudit[this.KEY_SOURCE_RECORD_COUNT];
        var migratedRecordCount = dataPatternRecordsAudit[this.KEY_MIGRATED_RECORD_COUNT];
        if (sourceRecordCount == migratedRecordCount)
            return this.PRODUCTION_ACTION_HISTORY_STATUS_TYPE_COMPLETE;
        else if (migratedRecordCount == 0)
            return this.PRODUCTION_ACTION_HISTORY_STATUS_TYPE_ERROR;
        else
            return this.PRODUCTION_ACTION_HISTORY_STATUS_TYPE_PARTIAL;
    },
    /**
     * Creates an entry in the dp_product_action_history table reporting the migration details.
     */
    _createProductActionHistory: function() {
        var productActionHistoryGr = new GlideRecord('dp_product_action_history');
        productActionHistoryGr.initialize();
        productActionHistoryGr.setValue('correlation_id', this.PRODUCTION_ACTION_HISTORY_CORRELATION_ID);
        productActionHistoryGr.setValue('feature', this.PRODUCTION_ACTION_HISTORY_FEATURE_NAME);
        productActionHistoryGr.setValue('status_type', this._getMigrationStatus());
        productActionHistoryGr.setValue('status_message', JSON.stringify(this.MIGRATION_AUDIT, null, 2));
        productActionHistoryGr.setWorkflow(false);
        productActionHistoryGr.insert();
    }
};

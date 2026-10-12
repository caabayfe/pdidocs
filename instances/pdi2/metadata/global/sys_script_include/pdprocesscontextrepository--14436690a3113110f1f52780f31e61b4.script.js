var PDProcessContextRepository = Class.create();
PDProcessContextRepository.prototype = {
    initialize: function() {},
    archiveProcessContexts: function(contextIds) {
        var terminalProcessContextIds = this._getTerminalContextIdsToProcess(contextIds);

        // this will serialize processes if they are not ready for deletion
        var processedContexts = this._serializeProcessContexts(terminalProcessContextIds);
        var contextsToCleanUpRecordsFor = processedContexts.contextsToCleanUpRecordsFor;
        var contextIdsToDelete = processedContexts.contextIdsToDelete;

        this._deleteExecutionRecords(contextsToCleanUpRecordsFor, contextIdsToDelete);

        return {
            archived: processedContexts.contextIdsToArchive,
            deleted: contextIdsToDelete.length
        };
    },
    // this will delete execution records without checking for data retention rules
    // is to be used for emergencies only
    deleteProcessExecutionRecords: function(contextIds) {
        var terminalProcessContextIds = this._getTerminalContextIdsToProcess(contextIds);

        this._deleteExecutionRecords(terminalProcessContextIds, terminalProcessContextIds);
    },
    _getTerminalContextIdsToProcess: function(contextIds) {
        var terminalProcessContextIds = [];

        var process = new GlideRecord(PDConstants.TABLES.PD_CONTEXT);
        process.addQuery(PDConstants.FIELDS.SYS_ID, 'IN', contextIds);
        process.query();

        // Filter out non-terminal process contexts just in case
        while (process.next()) {
            if (this._isProcessTerminal(process.getValue(PDConstants.FIELDS.STATE))) {
                terminalProcessContextIds.push(process.getUniqueValue());
            }
        }

        return terminalProcessContextIds;
    },
    _deleteExecutionRecords: function(contextsToCleanUpRecordsFor, contextIdsToDelete) {
        this.deleteElementMappingsAndVariableValues(contextsToCleanUpRecordsFor);
        this._deleteRecordsByQuery(
            PDConstants.TABLES.PD_ACTIVITY_CONTEXT,
            PDConstants.FIELDS.CONTEXT,
            contextsToCleanUpRecordsFor
        );
        this._deleteRecordsByQuery(
            PDConstants.TABLES.PD_LANE_CONTEXT,
            PDConstants.FIELDS.CONTEXT,
            contextsToCleanUpRecordsFor
        );
        this._deleteRecordsByQuery(
            PDConstants.TABLES.PD_CONTEXT_LOG,
            PDConstants.FIELDS.CONTEXT,
            contextsToCleanUpRecordsFor
        );
        this._deleteRecordsByQuery(
            PDConstants.TABLES.PD_CONTEXT,
            PDConstants.FIELDS.SYS_ID,
            contextIdsToDelete
        );
    },
    deleteElementMappingsAndVariableValues: function(contextIds) {
        if (contextIds.length === 0)
            return;

        var laneContextIds = this._getItemIdsByProcessContexts(PDConstants.TABLES.PD_LANE_CONTEXT, PDConstants.FIELDS.CONTEXT, contextIds);
        var activityContextIds = this._getItemIdsByProcessContexts(PDConstants.TABLES.PD_ACTIVITY_CONTEXT, PDConstants.FIELDS.CONTEXT, contextIds);
        var allContextIds = contextIds.concat(laneContextIds, activityContextIds);

        this._deleteRecordsByQuery(
            PDConstants.TABLES.ELEMENT_MAPPING,
            PDConstants.FIELDS.ID,
            allContextIds
        );
        this._deleteRecordsByQuery(
            PDConstants.TABLES.VARIABLE_VALUE,
            PDConstants.FIELDS.DOCUMENT_KEY,
            allContextIds
        );
    },
    _isProcessTerminal: function(state) {
        var STATE_VALUES = PDConstants.STATE_VALUES;
        return state === STATE_VALUES.COMPLETE || state === STATE_VALUES.SKIPPED || state === STATE_VALUES.CANCELLED || state === STATE_VALUES.ERROR;
    },
    _getItemIdsByProcessContexts: function(table, fieldToMatch, processContextIds) {
        var itemIds = [];
        var item = new GlideRecord(table);
        item.addQuery(fieldToMatch, 'IN', processContextIds);
        item.query();

        while (item.next()) {
            itemIds.push(item.getUniqueValue());
        }

        return itemIds;
    },
    _serializeProcessContexts: function(processContextIds) {
        if (!processContextIds || !processContextIds.length) {
            return {
                contextsToCleanUpRecordsFor: [],
                contextIdsToDelete: []
            };
        }

        var pdContext = new GlideRecord(PDConstants.TABLES.PD_CONTEXT);
        pdContext.addQuery(PDConstants.FIELDS.SYS_ID, 'IN', processContextIds);
        pdContext.query();

        var contextsToCleanUpRecordsFor = [];
        var contextIdsToDelete = [];
        var contextIdsToArchive = 0;

        while (pdContext.next()) {
            var contextSysId = pdContext.getUniqueValue();

            // should this context be serialized or deleted?
            var shouldRecordBeDeleted = this._shouldRecordBeDeleted(pdContext);

            if (shouldRecordBeDeleted) {
                // if the context has been archived already, its records have already been cleaned up
                if (!pdContext.getValue(PDConstants.FIELDS.ARCHIVE)) {
                    contextsToCleanUpRecordsFor.push(contextSysId);
                    // if the context has not been archived then the child contexts still exist
                    var childContexts = this._lookupChildPlaybooks(contextSysId);
                    if (childContexts && childContexts.length) {
                        for (var i = 0; i < childContexts.length; i++) {
                            var id = childContexts[i];
                            contextsToCleanUpRecordsFor.push(id);
                            contextIdsToDelete.push(id);
                        }
                    }
                }

                contextIdsToDelete.push(contextSysId);
                continue;
            }

            // has it met the retention policy for archiving and has not been archived
            if (!shouldRecordBeDeleted && !pdContext.getValue(PDConstants.FIELDS.ARCHIVE)) {
                // serializeResult is a list that will include contextIds of root playbook and all of its nested playbooks
                var serializeResult = sn_playbook.PlaybookExperience.serializePlaybookContext(pdContext);

                if (!serializeResult || !serializeResult.length) {
                    gs.error("Failed serialization for playbook context: " + contextSysId);
                } else {
                    for (var i = 0; i < serializeResult.length; i++) {
                        var id = serializeResult[i];
                        contextsToCleanUpRecordsFor.push(id);
                        if (id !== contextSysId) { // delete nested playbooks
                            contextIdsToDelete.push(id);
                        }
                    }
                    contextIdsToArchive++;
                }
            }
        }

        if (contextIdsToArchive > 0)
            gs.info("Archiving " + contextIdsToArchive + " playbook contexts.");
        if (contextIdsToDelete.length > 0)
            gs.info("Deleting " + contextIdsToDelete.length + " playbook contexts.");

        return {
            contextsToCleanUpRecordsFor: contextsToCleanUpRecordsFor,
            contextIdsToDelete: contextIdsToDelete,
            contextIdsToArchive: contextIdsToArchive
        };
    },

    _shouldRecordBeDeleted: function(contextRecord) {
        if (contextRecord.getValue(PDConstants.FIELDS.STATE) === PDConstants.STATE_VALUES.ERROR)
            return false;

        var dataRetentionPeriod = PDConstants.DEFAULT_RETENTION_PERIOD_CHOICE;

        if (contextRecord.process_definition && contextRecord.process_definition.source) {
            var overrideVal = contextRecord.process_definition.source.data_retention_period_override;
            if (overrideVal)
                dataRetentionPeriod = overrideVal.toString();

            if (!dataRetentionPeriod) {
                var typeVal = contextRecord.process_definition.source.process_type &&
                          contextRecord.process_definition.source.process_type.data_retention_period;
                if (typeVal)
                  dataRetentionPeriod = typeVal.toString();
            }
        }

        // if the context record has an input record, check to see if that record exists.
        // if it does, we do not want to delete anything
        var parentRecordSysId = contextRecord.getValue(PDConstants.FIELDS.INPUT_RECORD);
        var parentRecordTable = contextRecord.getValue(PDConstants.FIELDS.INPUT_TABLE);
        if (parentRecordSysId && parentRecordTable) {
            var parentRecord = new GlideRecord(parentRecordTable);
            if (parentRecord.get(parentRecordSysId))
                return false;
        }

        var lastUpdated = contextRecord.getValue('sys_updated_on');
        return this._hasMetRetentionPeriod(lastUpdated, dataRetentionPeriod);
    },

    _shouldRecordBeArchived: function(lastUpdated) {
        var retentionPolicyDays = gs.getProperty("sn_pa_designer.data_retention_policy");
        var lastUpdatedDate = new GlideDateTime(lastUpdated);
        var retentionCutoffDate = new GlideDateTime();

        return lastUpdatedDate.beforeOrEquals(retentionCutoffDate.addDays(-Math.abs(retentionPolicyDays, 10)));
    },

    _hasMetRetentionPeriod: function(lastUpdated, dataRetentionPeriod) {
        var lastUpdatedDate = new GlideDateTime(lastUpdated);
        var retentionCutoffDate = new GlideDateTime();

        // Expecting format like "2_week"
        var parts = dataRetentionPeriod.split("_");
        if (parts.length !== 2) {
            gs.error("Invalid retention period: " + dataRetentionPeriod);
            return false;
        }

        var number = -Math.abs(parseInt(parts[0], 10));
        var unit = parts[1]; // day, week, month, year

        switch (unit) {
            case 'day':
                retentionCutoffDate.addDays(number);
                break;
            case 'week':
                retentionCutoffDate.addWeeks(number);
                break;
            case 'month':
                retentionCutoffDate.addMonths(number);
                break;
            case 'year':
                retentionCutoffDate.addYears(number);
                break;
            default:
                gs.error("Unsupported retention unit: " + unit);
                return false;
        }

        return lastUpdatedDate.compareTo(retentionCutoffDate) <= 0;
    },

    _lookupChildPlaybooks: function (contextId) {
        var gr = new GlideRecord(PDConstants.TABLES.PD_CONTEXT);
        var grSubQuery = gr.addJoinQuery(PDConstants.TABLES.PD_ACTIVITY_CONTEXT, PDConstants.FIELDS.PARENT_ACTIVITY_CONTEXT, PDConstants.FIELDS.SYS_ID);
        grSubQuery.addCondition(PDConstants.FIELDS.CONTEXT, contextId);
        gr.query();

        var childContexts = [];
        while (gr.next()) {
            childContexts.push(gr.getUniqueValue());
        }

        return childContexts;
    },

    _deleteRecordsByQuery: function(table, fieldToMatch, itemIds) {
        if (itemIds.length === 0)
            return;

        var records = new GlideRecord(table);
        records.addQuery(fieldToMatch, 'IN', itemIds);
        records.query();
        records.setMultipleActionForceChunking(true);
        records.deleteMultiple();
    },
    type: 'PDProcessContextRepository'
};

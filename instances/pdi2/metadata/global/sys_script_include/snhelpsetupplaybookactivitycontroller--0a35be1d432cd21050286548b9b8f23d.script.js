var SNHelpSetupPlaybookActivityController = Class.create();
SNHelpSetupPlaybookActivityController.prototype = {
    initialize: function() {
        this.result = {};
    },

    addSysIdsInRealtedRecordsIfRecordAlreadyExists: function(relatedRecords, parentRootSysId) {
        if (relatedRecords.length) {
            relatedRecords.forEach(function(relatedRecord) {
                if (!relatedRecord.sys_id) {
                    var columns = relatedRecord.columns || {};
                    var columnFields = relatedRecord.mandatory_fields || Object.keys(columns) || [];
                    if (columnFields.length) {
                        var gr = new GlideRecordSecure(relatedRecord.table);
                        columnFields.forEach(function(field) {
                            gr.addQuery(field, columns[field] === 'parent_root' ? parentRootSysId : columns[field]);
                        });
                        gr.query();
                        if (gr.next()) {
                            relatedRecord.sys_id = gr.sys_id.toString();
                        }
                    }
                }
            });
        }
    },

    addSysIdsToSchemaIfRecordAlreadyExists: function(schema) {
        var columns = schema.columns || {};
        var columnFields = schema.mandatory_fields || Object.keys(columns) || [];

        if (!schema.sys_id && columnFields.length) {
            var gr = new GlideRecordSecure(schema.table);
            columnFields.forEach(function(field) {
                gr.addQuery(field, columns[field]);
            });
            gr.query();
            if (gr.next()) {
                schema.sys_id = gr.sys_id.toString();
            }
        }
        if (schema.sys_id) {
            for (var relatedListName in schema.related_lists) {
                this.addSysIdsInRealtedRecordsIfRecordAlreadyExists(schema.related_lists[relatedListName], schema.sys_id);
            }

            if (schema.references && schema.references.length) {
                var refFields = schema.references;
                this.addSysIdsInRealtedRecordsIfRecordAlreadyExists(refFields);
            }
        }
    },

    formColumns: function(gr, columns) {
        for (var key in columns) {
            if (columns.hasOwnProperty(key)) {
                gr[key] = columns[key];
            }
        }
    },

    actionOnRecord: function(gr, schema, action) {
        try {
            var columns = schema.columns;
            var sys_id = schema.sys_id;
            if (sys_id && action !== 'delete') {
                action = 'update';
            }
            switch (action) {
                case 'insert': {
                    gr.initialize();
                    this.formColumns(gr, columns);
                    var newSysId = gr.insert();
                    schema.sys_id = newSysId;
                    break;
                }
                case 'update': {
                    if (gr.get('sys_id', sys_id)) {
                        this.formColumns(gr, columns);
                        gr.update();
                    } else {
                        gs.info(gs.getMessage('SNHelpSetupPlaybookActivityController update action, Record not found with sys_id: {0}', sys_id));
                    }
                    break;
                }
                case 'delete': {
                    if (gr.get('sys_id', sys_id)) {
                        gr.deleteRecord();
                    } else {
                        gs.info(gs.getMessage('SNHelpSetupPlaybookActivityController delete action, Record not found with sys_id: {0} ', sys_id));
                    }
                    break;
                }
                default:
                    break;
            }
        } catch (e) {
            schema.errMsg = e;
        }
    },


    mapRelatedRecords: function(parentRootGr, relatedRecords, isRef) {
        for (var i = 0; i < relatedRecords.length; i++) {
            var relatedRecord = relatedRecords[i];
            var relatedTable = relatedRecord.table;
            var relatedRecordGr = new GlideRecordSecure(relatedTable);

            for (var key in relatedRecord.columns) {
                var columnValue = relatedRecord.columns[key];
                if (columnValue === 'parent_root') {
                    relatedRecord.columns[key] = parentRootGr.sys_id;
                }
            }
            this.actionOnRecord(relatedRecordGr, relatedRecord, relatedRecord.action);
            if (isRef) {
                parentRootGr.setValue(relatedRecord.parent_table_column, relatedRecordGr.sys_id);
                parentRootGr.update();
            }
        }
    },

    isCRUDAllowed: function(schema) {
        var tables = [];
        tables.push({
            table: schema.table,
            action: schema.action
        });
        for (var relatedListName in schema.related_lists) {
            var relatedRecords = schema.related_lists[relatedListName];
            for (var i = 0; i < relatedRecords.length; i++) {
                var relatedRecord = relatedRecords[i];
                var sys_id = relatedRecord.sys_id;
                var table = relatedRecord.table;
                var action = relatedRecord.action;
                action = (sys_id && action !== 'delete') ? 'update' : action;
                tables.push({
                    table: table,
                    action: action
                });
            }
        }

        var isACLAllowed = true;
        for (var t = 0; t < tables.length; t++) {
            var gr = new GlideRecordSecure(tables[t].table);
            if (tables[t].action == 'delete' && !gr.canDelete()) {
                isACLAllowed = false;
                break;
            } else if (!gr.canWrite() && !gr.canCreate()) {
                isACLAllowed = false;
                break;
            }
        }

        return isACLAllowed;
    },

    createRecord: function(schema) {
        var response = {};
        if (this.isCRUDAllowed(schema)) {
            this.addSysIdsToSchemaIfRecordAlreadyExists(schema);
            var parentRootGr = new GlideRecordSecure(schema.table);
            this.actionOnRecord(parentRootGr, schema, schema.action);
            if (schema.sys_id) {
                for (var relatedListName in schema.related_lists) {
                    var relatedLists = schema.related_lists[relatedListName] || [];
                    if (relatedLists && relatedLists.length) {
                        this.mapRelatedRecords(parentRootGr, relatedLists);
                    }
                }
                var refFields = schema.references || [];
                if (refFields && refFields.length) {
                    this.mapRelatedRecords(parentRootGr, refFields, true);
                }
                response = {
                    status: 200,
                    data: schema
                };
            } else {
                response = {
                    status: 500,
                    message: gs.getMessage('Failed to create record in table: {0}', schema.table)
                };
            }
        } else {
            response = {
                status: 500,
                message: gs.getMessage('ACL violation on creating records')
            };
        }
        return response;
    },

    buildColumn: function(gr, column) {
        var colResult;
        var displayValue = gr[column] && gr[column].getDisplayValue();
        var value = gr[column] && gr[column].getValue();
        if (displayValue == value) {
            colResult = displayValue;
        } else {
            colResult = {
                display_value: displayValue,
                value: value
            };
        }
        return colResult;
    },

    getRecordDetailsForSchema: function(schema) {
        var references = schema.references || {};
        var gr = new GlideRecordSecure(schema.table);
        gr.get('sys_id', schema.sys_id);
        for (var columnIndex in schema.columns) {
			var columnName = schema.columns[columnIndex];
            this.result[columnName] = this.buildColumn(gr, columnName);
        }

        for (var referenceColumn in references) {
            var referenceColumnSysId = gr[referenceColumn] && gr[referenceColumn].getValue();
            if (referenceColumnSysId) {
                var referenceObj = references[referenceColumn];
                var refGr = new GlideRecordSecure(referenceObj.table);
                refGr.get(referenceColumnSysId);
                refGr.query();
                if (refGr.next()) {
                    var refRecord = {};
                    for (var rfColumnIndex in referenceObj.columns) {
                        var rfColumnName = referenceObj.columns[rfColumnIndex];
                        refRecord[rfColumnName] = this.buildColumn(refGr, rfColumnName);
                    }
                    this.result.references[referenceColumn] = refRecord;
                }
            }
        }
    },

    getRecordDetailsForRelatedLists: function(schema) {
        var relatedLists = schema.related_lists || {};
        var parent_root_sys_id = schema.sys_id;
        for (var relatedListName in relatedLists) {
            var relatedList = relatedLists[relatedListName];
            var gr = new GlideRecordSecure(relatedList.table);
            gr.addQuery(relatedList.foreign_key_column, parent_root_sys_id);
            gr.query();
            var relatedRecords = [];
            while (gr.next()) {
                var relatedRecord = {};
                for (var rlColumnIndex in relatedList.columns) {
					var rlColumnName = relatedList.columns[rlColumnIndex];
                    relatedRecord[rlColumnName] = this.buildColumn(gr, rlColumnName);
                }
                relatedRecords.push(relatedRecord);
            }
            this.result.related_lists[relatedListName] = relatedRecords;
        }
    },

    checkRequiredSchemaExists: function(schema) {

        var table = schema.table,
            sys_id = schema.sys_id,
            columns = schema.columns,
            related_lists = schema.related_lists,
            references = schema.references,
            errorMessages = [];

        if (!table || !sys_id || !columns || !columns.length) {
            errorMessages.push(gs.getMessage('Missing required parameters at parent record'));
        }

        for (var relatedListName in related_lists) {
            var relatedList = related_lists[relatedListName];
            var rlTtable = relatedList.table,
                rlColumns = relatedList.columns,
                rlForeignKeyColumn = relatedList.foreign_key_column;

            if (!rlTtable || !rlColumns || !rlColumns.length || !rlForeignKeyColumn) {
                errorMessages.push(gs.getMessage('Missing required parameters in related links'));
            }
        }

        for (var reference in references) {
            var referenceName = references[reference];
            var refTable = referenceName.table,
                refColumns = referenceName.columns;
            if (!refTable || !refColumns || !refColumns.length) {
                errorMessages.push(gs.getMessage('Missing required parameters in references'));
            }
        }
        return errorMessages;
    },

    getRecord: function(schema) {
        var error = this.checkRequiredSchemaExists(schema);
        if (!error.length) {
            this.result = {
                table: schema.table,
                sys_id: schema.sys_id,
                related_lists: {},
                references: {}
            };
            this.getRecordDetailsForSchema(schema);
            this.getRecordDetailsForRelatedLists(schema);
            return ({
                status: 200,
                data: this.result
            });
        } else {
            return ({
                status: 500,
                error: error
            });
        }
    },
    type: 'SNHelpSetupPlaybookActivityController'
};

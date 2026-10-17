var AISAdminConsoleIndexedSourceUtils = Class.create();
AISAdminConsoleIndexedSourceUtils.prototype = {
    initialize: function() {},

    type: 'AISAdminConsoleIndexedSourceUtils',

    buildMessageItem: function(status, icon, message) {
        return {
            status: status,
            icon: icon,
            content: {
                type: 'html',
                value: '<span>' + message + '</span>'
            },
            action: {
                type: 'dismiss'
            }
        };
    },
    getFieldListFromSource: function(source) {
        var output = [];
        var tableGR = new GlideRecord(source);
        tableGR.initialize();

        var fields = tableGR.getFields();
        for (var i = 0; i < fields.size(); i++) {
            var field = fields.get(i);
            output.push(field.getName());
        }
        output.sort();

        return output;
    },
    getReferenceFieldListFromSource: function(source) {
        var output = [];
        var tableGR = new GlideRecord(source);
        tableGR.initialize();

        var fields = tableGR.getFields();
        for (var i = 0; i < fields.size(); i++) {
            var field = fields.get(i);
            if (field.getED().isReference()) {
                output.push(field.getName());
            }
        }
        output.sort();

        return output;
    },
    updateDatasourceFieldAttribute: function(datasourceFieldAttributeId, updates) {
        var status = 'Error';
        var items = [];
        var message = '';

        try {
            var data = updates;
            var gr = new GlideRecord('ais_datasource_field_attribute');

            var attributeGr = new GlideRecord('ais_configuration_attribute');
            attributeGr.addQuery('attribute', data.attribute);
            attributeGr.query();

            if (attributeGr.next()) {
                if (gr.get(datasourceFieldAttributeId)) { // Check if record exists
                    gr.source = data.source;
                    gr.attribute = attributeGr.sys_id;
                    gr.field = data.field;
                    gr.value = data.value;

                    // Attempt the update and capture messages if it fails
                    var updateResult = gr.update();
                    if (updateResult) {
                        gs.info('Datasource field attribute record updated successfully');
                        message = gs.getMessage('Field attribute updated successfully');
                        status = 'Success';
                        items.push(this.buildMessageItem('positive', 'check-outline', message));
                    } else {
                        // Capture any error messages from gs.addErrorMessage() or set a default message
                        var lastError = gs.getErrorMessages() || 'Record update failed';
                        message = gs.getMessage(lastError);
                        gs.error('Record update failed: ' + message);
                        items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
                    }
                } else {
                    gs.warn('Datasource field attribute record not found');
                    message = gs.getMessage('Datasource field attribute record not found');
                    items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
                }
            } else {
                gs.warn('Datasource attribute not found');
                message = gs.getMessage('Datasource attribute not found');
                items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
            }
        } catch (error) {
            gs.error('An error occurred while updating field attribute: ' + error.message);
            message = gs.getMessage('An error occurred');
            items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
        }

        return {
            status: status,
            items: items
        };
    },
    createDatasourceFieldAttribute: function(datasourceId, entries) {
        var status = 'Error';
        var items = [];
        var message = '';
        try {
            var data = entries;
            var gr = new GlideRecord('ais_datasource_field_attribute');
            var attributeGr = new GlideRecord('ais_configuration_attribute');
            attributeGr.addQuery('attribute', data.attribute);
            attributeGr.query();

            if (attributeGr.next()) {
                gr.datasource = datasourceId;
                gr.source = data.source;
                gr.attribute = attributeGr.sys_id;
                gr.field = data.field;
                gr.value = data.value;

                var newSysId = gr.insert();

                if (newSysId) {
                    gs.info('New record created successfully with sys_id: ' + newSysId);
                    message = gs.getMessage('Field attribute created successfully');
                    status = 'Success';
                    items.push(this.buildMessageItem('positive', 'check-outline', message));
                } else {
                    var lastError = gs.getErrorMessages() || 'Record creation failed';
                    message = gs.getMessage(lastError);
                    gs.error('Record creation failed: ' + message);
                    items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
                }
            } else {
                gs.warn('Attribute not found, record creation failed.');
                message = gs.getMessage('Attribute not found');
                items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
            }
        } catch (error) {
            gs.error('An error occurred while creating field attribute: ' + error.message);
            message = gs.getMessage('An error occurred while creating field attribute');
            items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
        }

        return {
            status: status,
            items: items
        };
    },

    deleteDatasourceFieldAttributes: function(datasourceFieldAttributeIds) {
        var status = 'Error';
        var items = [];
        var message = '';
        var deleteCount = 0;

        try {
            var gr = new GlideRecord('ais_datasource_field_attribute');

            datasourceFieldAttributeIds.forEach(function(sysId) {
                if (gr.get(sysId)) {
                    gr.deleteRecord();
                    deleteCount++;
                    gs.info('Datasource field attribute record deleted successfully with sys_id: ' + sysId);
                } else {
                    gs.warn('No record found with sys_id: ' + sysId);
                }
            });

            if (deleteCount > 0) {
                message = gs.getMessage('{0} field attribute(s) deleted successfully', deleteCount.toFixed(0));
                status = 'Success';
            } else {
                message = gs.getMessage('No field attributes were deleted');
                status = 'critical';
            }

            items.push(this.buildMessageItem(deleteCount > 0 ? 'positive' : 'critical', deleteCount > 0 ? 'check-outline' : 'circle-exclamation-outline', message));

        } catch (error) {
            gs.error('Something went wrong while deleting field attributes');
            message = gs.getMessage('An error occurred: {0}', error.message);
            items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
        }

        return {
            status: status,
            items: items
        };
    },
    getIndexedAndReferenceFieldData: function(datasourceSysId) {
        var datasourceGr = new GlideRecord('ais_datasource');
        if (!datasourceGr.get(datasourceSysId)) {
            gs.warn('No ais_datasource record found with sys_id: ' + datasourceSysId);
            return {};
        }

        var sourceTable = datasourceGr.getValue('source');
        var datasourceType = datasourceGr.getValue('type');
        var indexedSourceName = datasourceGr.getValue('name');

        // Function to check for calculated fields in a table
        function hasCalculatedFields(tableName) {
            var grDict = new GlideRecord('sys_dictionary');
            grDict.addQuery('name', tableName); // Match the table name
            grDict.addQuery('virtual', true);
            grDict.query();
            return grDict.hasNext(); // Return true if any record matches
        }

        // Function to check for reference fields in a table
        function hasReferenceFields(tableName) {
            var tableGR = new GlideRecord(tableName);
            tableGR.initialize();
            var fields = tableGR.getFields();
            for (var i = 0; i < fields.size(); i++) {
                var field = fields.get(i);
                if (field.getED().isReference()) {
                    return true; // Return true if any reference field is found
                }
            }
            return false; // Return false if no reference field is found
        }

        var allChildTables = new AisConfigurationUtil().getChildTablesInDatasource(datasourceSysId, sourceTable, datasourceType);
        var childTablesWithCalculatedFields = [];
        var childTablesWithReferenceFields = [];

        // Check calculated fields in source table and set the flag accordingly
        var indexedSourceHasCalculatedFields = hasCalculatedFields(sourceTable);

        // Populate childTablesWithCalculatedFields if the source table has calculated fields; otherwise, check each child table
        if (indexedSourceHasCalculatedFields) {
            childTablesWithCalculatedFields = allChildTables;
        } else {
            for (var i = 0; i < allChildTables.length; i++) {
                var childTable = allChildTables[i];
                if (hasCalculatedFields(childTable)) {
                    childTablesWithCalculatedFields.push(childTable);
                    indexedSourceHasCalculatedFields = true; // Set true if any child table has calculated fields
                }
            }
        }

        // Check reference fields in source table and set the flag accordingly
        var indexedSourceHasReferenceFields = hasReferenceFields(sourceTable);

        // Populate childTablesWithReferenceFields if the source table has reference fields; otherwise, check each child table
        if (indexedSourceHasReferenceFields) {
            childTablesWithReferenceFields = allChildTables;
        } else {
            for (var i = 0; i < allChildTables.length; i++) {
                var childTable = allChildTables[i];
                if (hasReferenceFields(childTable)) {
                    childTablesWithReferenceFields.push(childTable);
                    indexedSourceHasReferenceFields = true; // Set true if any child table has reference fields
                }
            }
        }

        var result = {
            indexedSourceName: indexedSourceName,
            indexedSourceHasCalculatedFields: indexedSourceHasCalculatedFields,
            indexedSourceHasReferenceFields: indexedSourceHasReferenceFields,
            allChildTables: allChildTables,
            childTablesWithCalculatedFields: childTablesWithCalculatedFields,
            childTablesWithReferenceFields: childTablesWithReferenceFields
        };

        return result;
    },
    getChildTablesFromTableName: function(tableName) {
        var result = [];

        if (tableName && new sn_ais.AisUtil().isTableIndexable(tableName)) {
            var childTables = [];
            var dbManager = GlideDBObjectManager.get();
            // get all child tables
            var list = dbManager.getTableExtensions(tableName);
            for (var i = 0; i < list.size(); i++)
                childTables.push(list.get(i));

            // get child tables belong to other datasources
            var tablesToBeRemoved = {};
            var grDatasource = new GlideRecord('ais_datasource');
            grDatasource.addQuery('source', '!=', tableName);
            grDatasource.query();
            while (grDatasource.next()) {
                var curSource = grDatasource.getValue('source');
                if (dbManager.isInstanceOf(curSource, tableName)) {
                    var extensions = dbManager.getAllExtensions(curSource);
                    for (var j = 0; j < extensions.size(); j++)
                        tablesToBeRemoved[extensions.get(j)] = true;
                }
            }

            for (var k = 0; k < childTables.length; k++) {
                if (!(childTables[k] in tablesToBeRemoved)) {
                    var childTable = childTables[k];
                    result.push({
                        id: childTable,
                        label: childTable
                    });
                }
            }
        }

        return result;
    },
    createChildTableEntry: function(sysId, active, table) {
        var gr = new GlideRecord('ais_child_table');
        gr.initialize();
        gr.setValue('datasource', sysId);
        gr.setValue('active', active);
        gr.setValue('table', table);
        gr.setValue('sys_scope', 'global');
        return gr.insert();
    },
    getAllIndexableTables: function(filterIndexedTables) {
        return new AisConfigurationUtil().getAllIndexableTables(filterIndexedTables);
    },
    updateDatasourceAttribute: function(datasourceAttributeId, payload) {
        var status = 'Error';
        var items = [];
        var message = '';

        try {
            var attributeId = null;

            // Get attribute sys_id from ais_configuration_attribute
            var attributeGr = new GlideRecord('ais_configuration_attribute');
            attributeGr.addQuery('attribute', payload.attribute);
            attributeGr.query();

            if (attributeGr.next()) {
                attributeId = attributeGr.sys_id;
            }

            var gr = new GlideRecord('ais_datasource_attribute');

            if (gr.get(datasourceAttributeId)) {
                gr.source = payload.source;
                gr.attribute = attributeId;
                gr.value = payload.value;
                gr.datasource = payload.datasourceId;

                var updateResult = gr.update();
                if (updateResult) {
                    gs.info('Datasource attribute updated successfully');
                    message = gs.getMessage('Datasource attribute updated successfully');
                    status = 'Success';
                    items.push(this.buildMessageItem('positive', 'check-outline', message));
                } else {
                    var lastError = gs.getErrorMessages() || 'Record update failed';
                    message = gs.getMessage(lastError);
                    gs.error('Record update failed: ' + message);
                    items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
                }
            } else {
                gs.warn('Record not found for the given datasourceAttributeId');
                message = gs.getMessage('Datasource attribute record not found');
                items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
            }
        } catch (error) {
            gs.error('An error occurred while updating the datasource attribute: ' + error.message);
            message = gs.getMessage('An error occurred');
            items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
        }

        return {
            status: status,
            items: items
        };
    },
    createDatasourceAttribute: function(payload) {
        var status = 'Error';
        var items = [];
        var message = '';

        try {
            var attributeId = null;

            // Get attribute sys_id from ais_configuration_attribute
            var attributeGr = new GlideRecord('ais_configuration_attribute');
            attributeGr.addQuery('attribute', payload.attribute);
            attributeGr.query();

            if (attributeGr.next()) {
                attributeId = attributeGr.sys_id;
            }

            // Create a new record in ais_datasource_attribute
            var gr = new GlideRecord('ais_datasource_attribute');
            gr.initialize();
            gr.source = payload.source;
            gr.attribute = attributeId;
            gr.value = payload.value;
            gr.datasource = payload.datasourceId;

            var insertResult = gr.insert();
            if (insertResult) {
                gs.info('Datasource attribute created successfully');
                message = gs.getMessage('Datasource attribute created successfully');
                status = 'Success';
                items.push(this.buildMessageItem('positive', 'check-outline', message));
            } else {
                var lastError = gs.getErrorMessages() || 'Record creation failed';
                message = gs.getMessage(lastError);
                gs.error('Record creation failed: ' + message);
                items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
            }
        } catch (error) {
            gs.error('An error occurred while creating the datasource attribute: ' + error.message);
            message = gs.getMessage('An error occurred');
            items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
        }

        return {
            status: status,
            items: items
        };
    },
    deleteDatasourceAttributes: function(datasourceAttributeIds) {
        var status = 'Error';
        var items = [];
        var message = '';
        var deleteCount = 0;

        try {
            var gr = new GlideRecord('ais_datasource_attribute');

            datasourceAttributeIds.forEach(function(sysId) {
                if (gr.get(sysId)) {
                    gr.deleteRecord();
                    deleteCount++;
                    gs.info('Datasource attribute record deleted successfully with sys_id: ' + sysId);
                } else {
                    gs.warn('No record found with sys_id: ' + sysId);
                }
            });

            if (deleteCount > 0) {
                message = gs.getMessage('{0} attribute(s) deleted successfully', deleteCount.toFixed(0));
                status = 'Success';
            } else {
                message = gs.getMessage('No attributes were deleted');
                status = 'critical';
            }

            items.push(this.buildMessageItem(deleteCount > 0 ? 'positive' : 'critical', deleteCount > 0 ? 'check-outline' : 'circle-exclamation-outline', message));

        } catch (error) {
            gs.error('Something went wrong while deleting attributes');
            message = gs.getMessage('An error occurred: {0}', error.message);
            items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
        }

        return {
            status: status,
            items: items
        };
    },
    updateIndexedSource: function(sysId, values, childTables) {
        var indexedSourceGr = new GlideRecord('ais_datasource');
        if (!sysId) { //Create
            indexedSourceGr.initialize();
        } else { //Update
            indexedSourceGr.get(sysId);
        }
        for (var i = 0; i < values.length; i++) {
            indexedSourceGr.setValue(values[i].key, values[i].value);
        }
        if (!sysId) {
            sysId = indexedSourceGr.insert();
        } else {
            indexedSourceGr.update();
        }

        var childTableGr = new GlideRecord('ais_child_table');
        childTableGr.addQuery('datasource', sysId);
        childTableGr.query();
        while (childTableGr.next()) {
            var table = childTableGr.getValue('table');
            for (var i = 0; i < childTables.length; i++) {
                if (childTables[i].label === table) {
                    childTableGr.setValue('active', childTables[i].selected);
                    childTableGr.update();
                    childTables[i].updated = true;
                }
            }
        }

        for (var i = 0; i < childTables.length; i++) {
            if (!childTables[i].updated) {
                this.createChildTableEntry(sysId, childTables[i].selected, childTables[i].label);
            }
        }
        return sysId;
    },
    updateSemanticIndexConfig: function(semanticIndexId, datasourceId, semanticIndexName, selectedChunkStrategy, overlapSentences, chunkUnit, chunkSize, maxTotalWords, semanticModel, isActive) {
        var status = 'Error';
        var items = [];
        var message = '';
        var id = '';
        var chunkId = '';
        try {
            var names = this.fetchDatasourceNames(datasourceId);
            var gr = new GlideRecord('ais_semantic_index_configuration');
            if (!semanticIndexId) { // create
                gr.initialize();
            } else { // update
                if (!gr.get(semanticIndexId)) {
                    message = gs.getMessage('Semantic Index configuration not found');
                    items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
                    return {
                        status: 'Error',
                        items: items
                    };
                }
                chunkId = gr.semantic_snippetization_configuration;
            }
            gr.setValue('datasource', names[0]);
            gr.setDisplayValue('datasource', names[1]);
            gr.setValue('active', isActive);
            gr.setValue('embedding_models', semanticModel.join(','));
            gr.setValue('semantic_field_name', semanticIndexName);
            var chunkData = this.updateSemanticChunkConfig(chunkId, selectedChunkStrategy, overlapSentences, chunkUnit, chunkSize, maxTotalWords);
            if (!chunkData.id) {
                message = gs.getMessage('Failed to update or create chunk configuration');
                items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
                return {
                    status: 'Error',
                    items: items
                };
            }
            gr.setValue('semantic_snippetization_configuration', chunkData.id);
            var result = semanticIndexId ? gr.update() : gr.insert();
            if (result) {
                id = gr.getUniqueValue();
                message = gs.getMessage('{0} semantic index configuration successfully', semanticIndexId ? 'Updated' : 'Created');
                items.push(this.buildMessageItem('positive', 'check-outline', message));
                status = 'Success';
            } else {
                var lastError = gs.getErrorMessages() || gs.getMessage('Failed to {0} semantic index configuration', semanticIndexId ? 'update' : 'create');
                message = gs.getMessage(lastError);
                gs.error('Record update failed: ' + message);
                items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
            }
        } catch (error) {
            message = gs.getMessage('An error occurred: {0}', error.message);
            items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
        }
        return {
            status: status,
            items: items,
            id: id
        };
    },
    updateSemanticChunkConfig: function(chunkId, selectedChunkStrategy, overlapSentences, chunkUnit, chunkSize, maxTotalWords) {
        var status = 'Error';
        var items = [];
        var message = '';
        var id = '';
        try {
            var semanticSnippetGr = new GlideRecord('ais_semantic_snippetization_configuration');
            if (!chunkId) { // create
                semanticSnippetGr.initialize();
            } else { // update
                if (!semanticSnippetGr.get(chunkId)) {
                    message = gs.getMessage('Semantic chunk configuration not found');
                    items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
                    return {
                        status: 'Error',
                        items: items
                    };
                }
            }
            if (selectedChunkStrategy === 'passage') {
                semanticSnippetGr.setValue('limit', chunkSize);
                semanticSnippetGr.setValue('limited_by', chunkUnit.toUpperCase());
                semanticSnippetGr.setValue('overlap_sentences', overlapSentences);
                semanticSnippetGr.setValue('snippet_mode', selectedChunkStrategy.toUpperCase());
            } else if (selectedChunkStrategy === 'truncate') {
                semanticSnippetGr.setValue('max_total_words', maxTotalWords);
                semanticSnippetGr.setValue('snippet_mode', selectedChunkStrategy.toUpperCase());
            } else {
                semanticSnippetGr.setValue('snippet_mode', 'CONCATENATE');
                semanticSnippetGr.setValue('max_total_words', -1);
            }
            var result = chunkId ? semanticSnippetGr.update() : semanticSnippetGr.insert();
            if (result) {
                id = semanticSnippetGr.getUniqueValue();
                message = gs.getMessage('{0} semantic chunk configuration successfully', chunkId ? 'Updated' : 'Created');
                items.push(this.buildMessageItem('positive', 'check-outline', message));
                status = 'Success';
            } else {
                message = gs.getMessage('Failed to {0} semantic chunk configuration', chunkId ? 'update' : 'create');
                items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
            }
        } catch (error) {
            message = gs.getMessage('An error occurred: {0}', error.message);
            items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
        }
        return {
            status: status,
            items: items,
            id: id
        };
    },
    updateSemanticFieldConfig: function(semanticFieldsId, datasourceRawName, semanticIndexId, fieldName, order, type) {
        var status = 'Error';
        var items = [];
        var message = '';
        var id = '';
        try {
            var semanticFieldsGr = new GlideRecord('ais_semantic_component_field');
            if (!semanticFieldsId) { // create
                semanticFieldsGr.initialize();
            } else { // update
                if (!semanticFieldsGr.get(semanticFieldsId)) {
                    message = gs.getMessage('Semantic fields configuration not found');
                    items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
                    return {
                        status: 'Error',
                        items: items
                    };
                }
            }
            semanticFieldsGr.setValue('component_field_name', fieldName);
            semanticFieldsGr.setValue('order', order);
            semanticFieldsGr.setValue('type', type);
            semanticFieldsGr.setValue('source', datasourceRawName);
            semanticFieldsGr.setValue('semantic_field', semanticIndexId);
            var result = semanticFieldsId ? semanticFieldsGr.update() : semanticFieldsGr.insert();
            if (result) {
                id = semanticFieldsGr.getUniqueValue();
                message = gs.getMessage('{0} semantic field configuration successfully', semanticFieldsId ? 'Updated' : 'Created');
                items.push(this.buildMessageItem('positive', 'check-outline', message));
                status = 'Success';
            } else {
                var lastError = gs.getErrorMessages() || gs.getMessage('Failed to {0} semantic field configuration', semanticFieldsId ? 'update' : 'create');
                message = gs.getMessage(lastError);
                gs.error('Record update failed: ' + message);
                items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
            }
        } catch (error) {
            message = gs.getMessage('An error occurred: {0}', error.message);
            items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
        }
        return {
            status: status,
            items: items,
            id: id,
            semanticIndexId: semanticIndexId
        };
    },
    deleteSemanticIndexConfig: function(semanticIndexIds) {
        var successCount = 0;
        var failCount = 0;
        var items = [];
        var status = 'Error';
        var message = '';
        try {
            var gr = new GlideRecord('ais_semantic_index_configuration');
            var self = this;
            semanticIndexIds.forEach(function(sysId) {
                if (gr.get(sysId)) {
                    // cascade delete exists for ais_semantic_snippetization_configuration and ais_semantic_component_field
                    gr.deleteRecord();
                    successCount++;
                } else {
                    failCount++;
                }
            });
            if (successCount > 0) {
                message = gs.getMessage('{0} semantic index record(s) deleted successfully', successCount.toFixed(0));
                items.push(self.buildMessageItem('positive', 'check-outline', message));
                gs.info(message);
            }
            if (failCount > 0) {
                message = gs.getMessage('{0} semantic index record(s) not found', failCount.toFixed(0));
                items.push(self.buildMessageItem('critical', 'circle-exclamation-outline', message));
                gs.info(message);
            }
            status = failCount > 0 ? 'Error' : 'Success';
        } catch (error) {
            message = gs.getMessage('An error occurred during deletion: {0}', error.message);
            items.push(self.buildMessageItem('critical', 'circle-exclamation-outline', message));
            gs.info(message);
        }
        return {
            status: status,
            items: items
        };
    },
    deleteSemanticFieldsConfig: function(semanticFieldsConfigIds) {
        var successCount = 0;
        var failCount = 0;
        var items = [];
        var status = 'Error';
        var message = '';
        try {
            var gr = new GlideRecord('ais_semantic_component_field');
            var self = this;
            semanticFieldsConfigIds.forEach(function(sysId) {
                if (gr.get(sysId)) {
                    gr.deleteRecord();
                    successCount++;
                } else {
                    failCount++;
                }
            }.bind(this));
            if (successCount > 0) {
                message = gs.getMessage('{0} semantic field record(s) deleted successfully', successCount.toFixed(0));
                items.push(self.buildMessageItem('positive', 'check-outline', message));
                gs.info(message);
            }
            if (failCount > 0) {
                gs.getMessage('{0} semantic field record(s) not found', failCount.toFixed(0));
                items.push(self.buildMessageItem('critical', 'circle-exclamation-outline', message));
                gs.info(message);
            }
            status = failCount > 0 ? 'Error' : 'Success';
        } catch (error) {
            message = gs.getMessage('An error occurred during deletion: {0}', error.message);
            items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
            gs.info(message);
        }
        return {
            status: status,
            items: items
        };
    },
    fetchDatasourceNames: function(datasourceId) {
        var names = [];
        var gr = new GlideRecord('ais_datasource');
        if (gr.get(datasourceId)) {
            names.push(gr.source);
            names.push(gr.name);
        }
        return names;
    },
    getSemanticIndexConfigs: function(currentSemanticIndexConfigId) {
        var data = {
            currentSemanticIndexConfigId: currentSemanticIndexConfigId,
            name: '',
            chunking_strategy: '',
            overlap_sentences: '',
            chunk_unit: '',
            chunk_size: '',
            max_total_words: '',
            embedding_models: [],
            is_active: ''
        };
        var gr = new GlideRecord('ais_semantic_index_configuration');
        if (gr.get(currentSemanticIndexConfigId)) {
            data.name = gr.semantic_field_name;

            var modelIds = gr.getValue('embedding_models').split(',');
            for (var i = 0; i < modelIds.length; i++) {
                var modelGr = new GlideRecord('ais_semantic_embedding_model');
                if (modelGr.get(modelIds[i])) {
                    data.embedding_models.push({
                        id: modelIds[i],
                        label: modelGr.getValue('name')
                    });
                }
            }

            data.is_active = gr.active;
            var strategy = gr.getDisplayValue('semantic_snippetization_configuration').toLowerCase();
            if (strategy === 'full text') {
                data.chunking_strategy = 'full_text';
                return data;
            }
            data.chunking_strategy = strategy;
            var chunkDetails = new GlideRecord('ais_semantic_snippetization_configuration');
            if (chunkDetails.get(gr.semantic_snippetization_configuration)) {
                if (strategy === 'passage') {
                    data.overlap_sentences = chunkDetails.overlap_sentences;
                    // transform WORDS to Words
                    var limited_by = chunkDetails.limited_by;
                    data.chunk_unit = limited_by.charAt(0) + limited_by.slice(1).toLowerCase();
                    data.chunk_size = chunkDetails.limit;
                } else if (strategy === 'truncate') {
                    data.max_total_words = chunkDetails.max_total_words;
                }
            }
        }
        return data;
    },
    fetchSemanticFieldsDetails: function(semanticFieldsId) {
        var data = {
            semanticFieldsId: semanticFieldsId,
            source: '',
            type: '',
            field_name: '',
            order: '',
            embeddingModel: ''
        };
        if (semanticFieldsId) {
            var gr = new GlideRecord('ais_semantic_component_field');
            if (gr.get(semanticFieldsId)) {
                data.source = gr.source;
                data.type = gr.type;
                data.field_name = gr.component_field_name;
                data.order = gr.order;
                data.embeddingModel = gr.embedding_models;
            }
        }
        return data;
    },
    isTableRententionEnforced: function(tableName) {
        var tablesToEnforceStr = gs.getProperty("glide.ais.require_retention_policy", "task");
        var tablesToEnforce = tablesToEnforceStr.split(",");

        var tableUtil = new global.TableUtils(tableName);
        var rootTable = tableUtil.getAbsoluteBase();
        return new ArrayUtil().contains(tablesToEnforce, rootTable);
    },
    deleteSearchSources: function(sourceIds) {
        var status = 'Error';
        var items = [];
        var message = '';
        var deleteCount = 0;

        try {
            var gr = new GlideRecord('ais_search_source');
            sourceIds.forEach(function(sysId) {
                if (gr.get(sysId)) {
                    gr.deleteRecord();
                    deleteCount++;
                    gs.info('Search source deleted successfully with sys_id: ' + sysId);
                } else {
                    gs.warn('No record found with sys_id: ' + sysId);
                }
            });
            if (deleteCount > 0) {
                message = gs.getMessage('{0} search source(s) deleted successfully', deleteCount.toFixed(0));
                status = 'Success';
            } else {
                message = gs.getMessage('No search sources were deleted');
                status = 'critical';
            }
            items.push(this.buildMessageItem(deleteCount > 0 ? 'positive' : 'critical', deleteCount > 0 ? 'check-outline' : 'circle-exclamation-outline', message));
        } catch (error) {
            gs.error('Something went wrong while deleting search sources');
            message = gs.getMessage('An error occurred: {0}', error.message);
            items.push(this.buildMessageItem('critical', 'circle-exclamation-outline', message));
        }
        return {
            status: status,
            items: items
        };
    },
    checkGuardRailLimit: function(tableName) {
        if (sn_ais.AisUtil.isGuardRailLimitApplicable(tableName)) {
            return true;
        } else {
            return false;
        }
    }
};

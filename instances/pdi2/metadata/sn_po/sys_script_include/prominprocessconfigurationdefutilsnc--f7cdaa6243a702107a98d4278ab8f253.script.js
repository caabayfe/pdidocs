var ProminProcessConfigurationDefUtilSNC = Class.create();
ProminProcessConfigurationDefUtilSNC.prototype = {
    initialize: function() {
        this.EXCLUDE_DATA_LIMIT = gs.getProperty('promin.limit.idle_time_exclusion_limit', 500);
        this.ROLES = {
            POWER_USER: 'sn_process_mining_power_user',
        };
    },
    createProminProcessConfiguration: function(table, isContentPack) {
        try {
            var grProcessDef = new GlideRecordSecure('promin_process_def');
            if (!grProcessDef.canCreate()) {
                return {
                    success: false,
                    message: gs.getMessage('The user is not allowed to create process configuration.'),
                    configId: null,
                };
            }
            // check for record existence
            var ga = new GlideAggregate("promin_process_def");
            ga.addQuery("table", table);
            ga.addQuery("content_pack", isContentPack);
            ga.addAggregate("COUNT");
            ga.query();
            if (ga.next()) {
                var entityCount = ga.getAggregate("COUNT");
                if (entityCount == 1) {
                    return {
                        success: false,
                        message: gs.getMessage('Only one process configuration is allowed per table.'),
                        configId: null,
                    };
                }
            }

            // insert new record
            grProcessDef.initialize();
            grProcessDef.setValue('table', table);
            grProcessDef.setValue('content_pack', isContentPack);
            var newConfigId = grProcessDef.insert();

            return {
                success: newConfigId ? true : false,
                message: gs.getMessage('Process configuration created.'),
                configId: newConfigId,
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Configuration creation failed.'),
                configId: '',
            };
        }
    },

    getTableColumns: function(table, types) {
        try {
            var tableFields = new global.ProminUtils().getTableColumns(table, types);
            return {
                success: true,
                message: gs.getMessage('Success'),
                result: tableFields
            };

        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Fail'),
                result: []
            };
        }
    },

    saveProcessConfig: function(sysId, payload) {
        try {
            var grProcessConfig = new GlideRecord('promin_process_def');
            if (!grProcessConfig.canWrite()) {
                return {
                    success: false,
                    message: gs.getMessage('The user is not allowed to update process configuration.'),
                    errorMessages: []
                };
            }
            grProcessConfig.get(sysId);
            var errorMessage = '';
            var validationResponses = [];

            for (var key in payload) {
                grProcessConfig.setValue(key, payload[key]);
            }

            var processConfigValidationResponse = new sn_po.ProminProcessConfigurationValidationUtil().validateProcessConfig(grProcessConfig);
            if (processConfigValidationResponse.success) {
                var id = grProcessConfig.update();
                if (gs.nil(id)) {
                    return {
                        success: false,
                        message: gs.getMessage('Process configuration updation failed.'),
                        errorMessages: []
                    };
                }
            } else {
                return {
                    success: false,
                    message: gs.getMessage('Process configuration updation failed.'),
                    errorMessages: processConfigValidationResponse.errorMessages
                };
            }
            return {
                success: true,
                message: gs.getMessage('Process finding configuration updated.'),
                errorMessages: []
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Process configuration updation failed.'),
                errorMessages: []
            };
        }
    },

    saveExcludeDataFilters: function(processId, excludeType, table, filterQuery) {
        try {
            if (!filterQuery) {
                // Clear existing filter
                var grProcessConfig = new GlideRecordSecure('promin_process_def');
                grProcessConfig.get(processId);

                if (excludeType === 'TEAMS') {
                    grProcessConfig.setValue('group_filter', '');
                } else if (excludeType === 'USERS') {
                    grProcessConfig.setValue('user_filter', '');
                }

                var id = grProcessConfig.update();
                if (gs.nil(id)) {
                    return {
                        success: false,
                        message: gs.getMessage('Save exclude data filters failed.'),
                        errorMessages: []
                    };
                }

                return {
                    success: true,
                    message: gs.getMessage('Exclude data filters saved.'),
                    errorMessages: []
                };
            }

            var ga = new GlideAggregate(table);
            ga.addEncodedQuery(filterQuery);
            ga.addAggregate('COUNT');
            ga.query();

            var recordCount = 0;

            if (ga.next()) {
                recordCount = ga.getAggregate('COUNT');
            }

            if (Number(recordCount) > Number(this.EXCLUDE_DATA_LIMIT)) {
                return {
                    success: false,
                    errorMessages: [gs.getMessage('Maximum of {0} records can be excluded.', [this.EXCLUDE_DATA_LIMIT])],
                };
            }

            grProcessConfig = new GlideRecordSecure('promin_process_def');
            grProcessConfig.get(processId);

            if (excludeType === 'TEAMS') {
                grProcessConfig.setValue('group_filter', filterQuery);
            } else if (excludeType === 'USERS') {
                grProcessConfig.setValue('user_filter', filterQuery);
            }

            var id = grProcessConfig.update();
            if (gs.nil(id)) {
                return {
                    success: false,
                    message: gs.getMessage('Save exclude data filters failed.'),
                    errorMessages: []
                };
            }

            return {
                success: true,
                message: gs.getMessage('Exclude data filters saved.'),
                errorMessages: []
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Save exclude data filters failed.'),
                errorMessages: []
            };
        }
    },

    exportToUpdateset: function(processId) {
        try {
            var grProcess = new GlideRecord('promin_process_def');
            if (!grProcess.get(processId)) {
                return {
                    success: false,
                    error: gs.getMessage('Process configuration not found.'),
                    message: '',
                };
            }
            if (!gs.hasRole('maint')) {
                return {
                    success: false,
                    error: gs.getMessage('You are not authorized to export process configuration.'),
                    message: '',
                };
            }

            var message = new global.ProminUIAction().exportProcessConfigToUpdateSet(grProcess);

            return {
                success: true,
                error: '',
                message: message,
            };
        } catch (err) {
            return {
                success: false,
                error: err,
                message: '',
            };
        }
    },

    createClusteringDefinition: function(table, name, fields) {
        try {
            var dataset = new sn_ml.DatasetDefinition({
                tableName: table,
                fieldNames: fields,
            });

            var newSolution = new sn_ml.ClusteringSolution({
                label: name,
                dataset: dataset,
                inputFieldNames: fields,
                algorithmConfig: {
                    algorithm: 'kmeans',
                    targetCoverage: '75',
                }
            });

            var solutionName = sn_ml.ClusteringSolutionStore.add(newSolution);

            if (!solutionName) {
                return {
                    success: false,
                    error: gs.getMessage('Clustering Solution Definition could not be created'),
                    createdClusteringSolutionName: '',
                };
            }

            return {
                success: true,
                error: '',
                createdClusteringSolutionName: solutionName,
            };
        } catch (err) {
            return {
                success: false,
                error: err.getMessage(),
                createdClusteringSolutionName: '',
            };
        }
    },

    createChildTableConfig: function(processDefId, table, sourceField, targetField) {
        try {
            var gr = new GlideRecordSecure('promin_child_table_config');
            gr.initialize();

            gr.setValue('process_def', processDefId);
            gr.setValue('table', table);
            gr.setValue('source_field', sourceField);
            gr.setValue('target_field', targetField);

            var newChildConfigId = gr.insert();
            if (!newChildConfigId) {
                return {
                    success: false,
                    error: gs.getMessage('Error occurred when creating child table config'),
                };
            }

            return {
                success: true,
                error: '',
            };
        } catch (err) {
            return {
                success: false,
                error: gs.getMessage('Error occurred when creating child table config'),
            };
        }
    },

    deleteChildTableConfig: function(childConfigId) {
        return new global.ProminUtils().deleteChildTableConfig(childConfigId);
    },

    updateChildTableConfig: function(childConfigId, sourceField) {
        try {
            var gr = new GlideRecordSecure('promin_child_table_config');
            if (!gr.get(childConfigId)) {
                return {
                    success: false,
                    error: gs.getMessage('Could not find child table config'),
                };
            }

            gr.setValue('source_field', sourceField);
            var id = gr.update();
            if (gs.nil(id)) {
                return {
                    success: false,
                    error: gs.getMessage('Error occurred when updating child table config'),
                };
            }

            return {
                success: true,
                error: '',
            };
        } catch (err) {
            return {
                success: false,
                error: gs.getMessage('Error occurred when updating child table config'),
            };
        }
    },

    deleteFindingDef: function(findingIds, table) {
        return new global.ProminUtils().deleteFindingDef(findingIds, table);
    },

    getProcessPermissions: function() {
        return new global.ProminConfigACLUtilSNC().getProcessPermissions();
    },

    mutateProcessCategoryKPI: function(processId, payload) {
        if (!payload.id) {
            return this._insertCategoryKPI(processId, payload);
        }
        if (payload.impactedKpis && payload.impactedKpis.length > 0) {
            return this._updateCategoryKPI(processId, payload);
        }
        return new global.ProminProcessConfigUtil().deleteProcessKPICategory(processId, payload);
    },

    _insertCategoryKPI: function(processId, payload) {
        try {
            var grNew = new GlideRecordSecure("promin_process_category_kpi");
            grNew.setValue('process_def', processId);
            grNew.setValue('category', payload.category);
            grNew.setValue('impacted_kpis', payload.impactedKpis);
            var categoryId = grNew.insert();
            return {
                success: !categoryId ? false : true,
                message: !categoryId ? gs.getMessage('Error occured while saving the KPI.') : gs.getMessage('KPI saved successfully.'),
                categoryId: categoryId,
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Error occured while saving the KPI.'),
                categoryId: categoryId,
            };
        }
    },

    _updateCategoryKPI: function(processId, payload) {
        try {
            var gr = new GlideRecordSecure("promin_process_category_kpi");
            gr.get(payload.id);
            gr.query();
            if (gr.next()) {
                gr.setValue('impacted_kpis', payload.impactedKpis);
                var id = gr.update();
                if (gs.nil(id)) {
                    return {
                        success: false,
                        message: gs.getMessage('Error occured while saving the KPI.'),
                        categoryId: null,
                    };
                }
                return {
                    success: true,
                    message: gs.getMessage('Category updated successfully.'),
                    categoryId: null,
                };
            }
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Error occured while saving the KPI.'),
                categoryId: null,
            };
        }
    },
    getProcessKPICategoryChoices: function(sysparm_query) {
        return new global.ProminProcessConfigUtil().getProcessKPICategoryChoices(sysparm_query);
    },

    getTableMetadata: function(table) {
        try {
            var grDictionary = new GlideRecord('sys_dictionary');
            grDictionary.addQuery('name', table);
            grDictionary.addQuery('internal_type', 'collection');
            grDictionary.query();

            if (!grDictionary.next()) {
                return {
                    success: false,
                    errors: [gs.getMessage('Something went wrong while retrieving table metadata.')],
                    metadata: {},
                };
            }

            return {
                success: true,
                errors: [],
                metadata: {
                    audit: Boolean(parseInt(grDictionary.getValue('audit'))),
                },
            };
        } catch (err) {
            return {
                success: false,
                errors: [gs.getMessage('Something went wrong while retrieving table metadata.')],
                metadata: {},
            };
        }
    },

    deleteProcessConfigurations: function(processIds, isContentPack) {
        try {
            var permissions = new global.ProminConfigACLUtilSNC().getProcessPermissions();
            var unableToDeleteConfigs = [];

            for (var i = 0; i < processIds.length; i += 1) {
                var grRuleBasedDefs = new GlideRecord('promin_finding_def');
                grRuleBasedDefs.addQuery('process_def', processIds[i]);
                grRuleBasedDefs.query();

                var grAutomateddDefs = new GlideRecord('promin_automated_finding');
                grAutomateddDefs.addQuery('process_def', processIds[i]);
                grAutomateddDefs.query();

                if (grRuleBasedDefs.getRowCount() > 0 || grAutomateddDefs.getRowCount() > 0) {
                    unableToDeleteConfigs.push(processIds[i]);
                } else {
                    if ((isContentPack && permissions.canDeleteContentPack) || (!isContentPack && permissions.canDelete)) {
                        var deleteResponse = new global.ProminUtils().deleteProcessConfig(processIds[i]);
                        if (!deleteResponse) {
                            unableToDeleteConfigs.push(processIds[i]);
                        }
                    }
                }
            }

            return {
                success: true,
                unableToDeleteConfigs: unableToDeleteConfigs,
            };
        } catch (err) {
            return {
                success: false,
                unableToDeleteConfigs: [],
            };
        }
    },

    upsertControlFlowFieldMapping: function(processId, payload) {
        try {
            for (var key in payload) {
                var entry = payload[key];
                var grMapping = this._findControlFlowMapping(processId, entry);
                var isUpdate = !grMapping.isNewRecord();

                grMapping.setValue('process_def', processId);
                grMapping.setValue('category', entry.category);
                grMapping.setValue('values', entry.values);

                var resultId = isUpdate ? grMapping.update() : grMapping.insert();
                if (gs.nil(resultId)) {
                    gs.error("Error while {0} a control flow mapping record for category {1}",
                        [isUpdate ? 'updating' : 'creating', entry.category]);
                }
                entry.id = grMapping.getUniqueValue();
            }
            return {
                success: true,
                message: gs.getMessage('Control flow mapping created successfully.'),
                result: payload
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Control flow mapping creation failed.'),
            };
        }
    },

    _findControlFlowMapping: function(processId, entry) {
        var grMapping = new GlideRecordSecure('promin_control_flow_mapping');
        if (entry.id && grMapping.get(entry.id)) {
            return grMapping;
        }

        grMapping.initialize();
        grMapping.addQuery('process_def', processId);
        grMapping.addQuery('category', entry.category);
        grMapping.query();
        if (grMapping.next()) {
            return grMapping;
        }

        grMapping.initialize();

        return grMapping;
    },

    getTableColumnChoices: function(table, field) {
        try {
            var hierarchyTables = new GlideTableHierarchy(table).getTables();
            var glideChoiceList = new GlideChoiceList();
            var choices = [];
            for (var i = 0; i < hierarchyTables.length; i += 1) {
                var choiceList = glideChoiceList.getChoiceList(hierarchyTables[i], field);
                for (var j = 0; j < choiceList.getSize(); j++) {
                    choices.push({
                        value: choiceList.getChoice(j).getValue(),
                        label: choiceList.getChoice(j).getLabel(),
                        hint: '',
                    });
                }
                if (choices.length > 0) {
                    break;
                }
            }
            return {
                success: true,
                message: "",
                result: choices,
            };
        } catch (err) {
            return {
                success: false,
                message: err,
                result: [],
            };
        }
    },

    _generateFieldsPayload: function(table) {
        if (!table) {
            return '[]';
        }

        var grTable = new GlideRecord(table);
        var allTables = new GlideTableHierarchy(table).getTables().toString();
        allTables = allTables.replace('[', '').replace(']', '').replace(/, /g, ',');
        var internalTypes = ['choice', 'string', 'boolean', 'integer', 'reference', 'journal', 'journal_input'];
        var fields = [];

        if (allTables) {
            var gr = new GlideRecord('sys_dictionary');
            gr.addQuery('name', 'IN', allTables);
            gr.addQuery('internal_type', 'IN', internalTypes);
            gr.addQuery('column_label', '!=', '');
            gr.addNotNullQuery('column_label');
            gr.query();

            while (gr.next()) {
                var fieldElement = grTable.getElement(gr.getValue('element'));
                if (fieldElement == null) continue;

                var internal = gr.getValue('internal_type');
                var choice = gr.getValue('choice');
                var isChoice = (internal === 'choice' || choice == 1 || choice == 3);

                var field = {
                    name: gr.getValue('element'),
                    label: gr.getValue('column_label')
                };

                if (internal === 'reference') {
                    field.type = 'Reference';
                    field.referenceTable = gr.getValue('reference');
                } else if (isChoice) {
                    field.type = 'Choice';
                } else if (internal === 'journal_input') {
                    field.type = 'Journal Input';
                } else if (internal === 'journal') {
                    field.type = 'Journal';
                } else if (internal === 'string') {
                    field.type = 'String';
                    field.maxLength = parseInt(gr.getValue('max_length'), 10);
                } else if (internal === 'boolean') {
                    field.type = 'Boolean';
                } else if (internal === 'integer') {
                    field.type = 'Integer';
                }

                fields.push(field);
            }
        }

        return fields;
    },

    _generateStatesPayload: function(table, field) {
        var hierarchyTables = new GlideTableHierarchy(table).getTables();
        var glideChoiceList = new GlideChoiceList();

        for (var i = 0; i < hierarchyTables.length; i += 1) {
            var choiceList = glideChoiceList.getChoiceList(hierarchyTables[i], field);

            var choices = [];

            for (var j = 0; j < choiceList.getSize(); j++) {
                if (gs.nil(choiceList.getChoice(j).getValue())) {
                    continue;
                }
                choices.push({
                    value: choiceList.getChoice(j).getValue(),
                    label: choiceList.getChoice(j).getLabel()
                });
            }

            if (choices.length > 0) {
                return choices;
            }
        }

        return [];
    },

    generateAIRecommendations: function(table) {
        if (!gs.hasRole(this.ROLES.POWER_USER)) {
            return {
                success: false,
                message: gs.getMessage('You are not authorized to generate AI recommendations.'),
                result: {},
            };
        }
        try {
            // Validate table is a recognized process table to prevent querying arbitrary tables
            var processDefGr = new GlideRecordSecure('promin_process_def');
            processDefGr.addQuery('table', table);
            processDefGr.setLimit(1);
            processDefGr.query();
            if (!processDefGr.hasNext()) {
                return {
                    success: false,
                    message: gs.getMessage('Table is not a recognized process table'),
                    result: {},
                };
            }

            var gr = new GlideRecord(table);

            // Prepare table payload
            var tablePayload = {
                name: table,
                label: gr.getLabel()
            };

            // If table is not valid i.e. has no label return error response
            if (!tablePayload.label) {
                return {
                    success: false,
                    message: gs.getMessage('Table is not valid'),
                    result: []
                };
            }

            // Prepare fields payload
            var fieldsPayload = this._generateFieldsPayload(table);

            var nowAssistUtil = new sn_po.ProminNowAssistUtil();

            // Request 1: Generate process config recommendations
            var processConfigRecommendations = nowAssistUtil.executeCapabilityRequest(
                { Fields: fieldsPayload, Table: tablePayload },
                nowAssistUtil.SKILLS.PROCESS_CONFIG_RECOMMENDATIONS
            ) || {};

            // Truncate each recommendation list to its size limit
            var recommendationLimits = {
                operational_status: 5,
                user_handoffs: 5,
                team_handoffs: 5,
                priority_volatility: 1,
                classification_shifting: 10,
                manual_communication: 10,
                intent_clustering: 10,
                key_contributor_attributes: 10,
            };

            for (var field in recommendationLimits) {
                if (processConfigRecommendations[field]) {
                    processConfigRecommendations[field] = processConfigRecommendations[field].slice(0, recommendationLimits[field]);
                }
            }

            // Reorder recommended fields by promin_field_recommendation rank
            processConfigRecommendations = this._reorderByFieldRecommendation(table, processConfigRecommendations);

            var stateResponsibilityMapping = {
                service_provider: [],
                service_requester: [],
                awaiting_other_process: [],
                solution_proposed: [],
                completed: [],
                other: [],
            };
            // The AI returns operational_status fields ordered by best recommendation first, so we use the first one as the state field for request 2
            var operationalStatusField = processConfigRecommendations.operational_status && processConfigRecommendations.operational_status[0];

            // Validate the AI-recommended field exists on the table before using it
            if (operationalStatusField && gr.isValidField(operationalStatusField)) {
                // Request 2: Generate state responsibility mapping using the top recommended operational status field
                try {
                    var statesPayload = this._generateStatesPayload(table, operationalStatusField);
                    stateResponsibilityMapping = nowAssistUtil.executeCapabilityRequest(
                        { States: statesPayload, Table: tablePayload },
                        nowAssistUtil.SKILLS.STATE_RESPONSIBILITY_MAPPING
                    );
                } catch (stateErr) {
                    gs.error('ProminProcessConfigurationDefUtilSNC.generateAIRecommendations: state responsibility mapping failed - ' + stateErr.message);
                }
            }

            return {
                success: true,
                message: gs.getMessage('Process configuration generated successfully'),
                result: {
                    processConfigRecommendations: processConfigRecommendations,
                    stateResponsibilityMapping: stateResponsibilityMapping,
                },
            };
        } catch (err) {
            gs.error('ProminProcessConfigurationDefUtilSNC.generateAIRecommendations: ' + err.message);
            return {
                success: false,
                message: gs.getMessage('Generating process configuration failed'),
                result: {},
            };
        }
    },

    generateStateResponsibilityMapping: function(table, stateField) {
        var defaultStateMapping = {
            service_provider: [],
            service_requester: [],
            awaiting_other_process: [],
            solution_proposed: [],
            completed: [],
            other: [],
        };

        if (!gs.hasRole(this.ROLES.POWER_USER)) {
            return {
                success: false,
                message: gs.getMessage('You are not authorized to generate AI recommendations.'),
                result: defaultStateMapping,
            };
        }
        try {
            // Validate table is a recognized process table to prevent querying arbitrary tables
            var processDefGr = new GlideRecordSecure('promin_process_def');
            processDefGr.addQuery('table', table);
            processDefGr.setLimit(1);
            processDefGr.query();
            if (!processDefGr.hasNext()) {
                return {
                    success: false,
                    message: gs.getMessage('Table is not a recognized process table'),
                    result: defaultStateMapping,
                };
            }

            var gr = new GlideRecord(table);

            // Prepare table payload
            var tablePayload = {
                name: table,
                label: gr.getLabel()
            };

            // If table is not valid i.e. has no label return error response
            if (!tablePayload.label) {
                return {
                    success: false,
                    message: gs.getMessage('Table is not valid'),
                    result: defaultStateMapping,
                };
            }

            // Validate stateField is a real column on the table to prevent arbitrary field probing
            if (!gr.isValidField(stateField)) {
                return {
                    success: false,
                    message: gs.getMessage('State field is not valid'),
                    result: defaultStateMapping,
                };
            }

            var stateResponsibilityMapping = defaultStateMapping;

            var nowAssistUtil = new sn_po.ProminNowAssistUtil();
            var statesPayload = this._generateStatesPayload(table, stateField);
            var llmResult = nowAssistUtil.executeCapabilityRequest(
                { States: statesPayload, Table: tablePayload },
                nowAssistUtil.SKILLS.STATE_RESPONSIBILITY_MAPPING
            );

            for (var key in llmResult) {
                if (llmResult.hasOwnProperty(key)) {
                    stateResponsibilityMapping[key] = llmResult[key];
                }
            }

            return {
                success: true,
                message: gs.getMessage('State responsibility mapping generated successfully'),
                result: stateResponsibilityMapping,
            };
        } catch (err) {
            gs.error('ProminProcessConfigurationDefUtilSNC.generateStateResponsibilityMapping: ' + err.message);
            return {
                success: false,
                message: gs.getMessage('State responsibility mapping generation failed'),
                result: defaultStateMapping,
            };
        }
    },

    _reorderByFieldRecommendation: function(table, recommendations) {
        var fieldRankMap = {};
        var gr = new GlideRecord('promin_field_recommendation');
        gr.addQuery('table', table);
        gr.orderBy('rank');
        gr.query();
        while (gr.next()) {
            fieldRankMap[gr.getValue('field')] = parseInt(gr.getValue('rank'), 10);
        }

        if (!Object.keys(fieldRankMap).length) {
            return recommendations;
        }

        var keys = ['operational_status', 'user_handoffs', 'team_handoffs'];
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (recommendations[key] && recommendations[key].length) {
                recommendations[key] = this._sortFieldsByRank(recommendations[key], fieldRankMap);
            }
        }

        return recommendations;
    },

    _sortFieldsByRank: function(fields, fieldRankMap) {
        var ranked = [];
        var unranked = [];
        for (var i = 0; i < fields.length; i++) {
            if (fieldRankMap.hasOwnProperty(fields[i])) {
                ranked.push(fields[i]);
            } else {
                unranked.push(fields[i]);
            }
        }
        ranked.sort(function(a, b) {
            return fieldRankMap[a] - fieldRankMap[b];
        });
        return ranked.concat(unranked);
    },

    type: 'ProminProcessConfigurationDefUtilSNC'
};

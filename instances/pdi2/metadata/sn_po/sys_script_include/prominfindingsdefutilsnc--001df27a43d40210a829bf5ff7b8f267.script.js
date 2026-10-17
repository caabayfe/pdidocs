var ProminFindingsDefUtilSNC = Class.create();
ProminFindingsDefUtilSNC.prototype = {
    initialize: function() {
        this.statusMap = {
            "success": "SUCCESS",
            "error": "ERROR"
        };
        this.FINDING_CLASS = {
            PROCESS: 'PROCESS',
            PROJECT: 'PROJECT',
        };
        this.INTERNAL_TYPES = {
            BOOLEAN: 'boolean',
            INTEGER: 'integer',
            STRING: 'string',
            DATE_TIME: 'glide_date_time',
        };
        this.PREDICATES = [{
                id: 'EQ',
                value: 'EQ',
                label: gs.getMessage('is'),
                fieldType: 'single',
            },
            {
                id: 'NEQ',
                value: 'NEQ',
                label: gs.getMessage('is not'),
                fieldType: 'single',
            },
            {
                id: 'IS_EMPTY',
                value: 'IS_EMPTY',
                label: gs.getMessage('is empty'),
                fieldType: 'none',
            },
            {
                id: 'IS_NOT_EMPTY',
                value: 'IS_NOT_EMPTY',
                label: gs.getMessage('is not empty'),
                fieldType: 'none',
            },
            {
                id: 'ANY',
                value: 'ANY',
                label: gs.getMessage('is anything'),
                fieldType: 'none',
            },
            {
                id: 'IN',
                value: 'IN',
                label: gs.getMessage('is one of'),
                fieldType: 'multi',
            },
            {
                id: 'NOT_IN',
                value: 'NOT_IN',
                label: gs.getMessage('is not one of'),
                fieldType: 'multi',
            },
            {
                id: 'STARTS_WITH',
                value: 'STARTS_WITH',
                label: gs.getMessage('starts with'),
                fieldType: 'text',
            },
            {
                id: 'ENDS_WITH',
                value: 'ENDS_WITH',
                label: gs.getMessage('ends with'),
                fieldType: 'text',
            },
            {
                id: 'LIKE',
                value: 'LIKE',
                label: gs.getMessage('contains'),
                fieldType: 'text',
            },
            {
                id: 'NOT_LIKE',
                value: 'NOT_LIKE',
                label: gs.getMessage('does not contain'),
                fieldType: 'text',
            },
        ];
        this.ARCHIVE_PREFIX = "ar_";
    },
    createProminAutomatedFinding: function(payload) {
        try {
            var grFindingDef = new GlideRecordSecure('promin_automated_finding');
            grFindingDef.initialize();

            for (var key in payload) {
                grFindingDef.setValue(key, payload[key]);
            }

            var validationUtil = new sn_po.ProminFindingsValidationUtil();
            var validationResponse = validationUtil.validateFindingDef(grFindingDef, 'insert');
            if (!validationResponse.success) {
                return validationResponse;
            }

            var newEntityId = grFindingDef.insert();
            if (newEntityId == null) {
                return {
                    success: false,
                    message: gs.getMessage('Finding creation failed.'),
                    entityId: '',
                    status: this.statusMap.error
                };
            }
            return {
                success: true,
                message: gs.getMessage('Automated finding created.'),
                entityId: newEntityId,
                status: this.statusMap.success
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Finding creation failed.'),
                entityId: '',
                status: this.statusMap.error
            };
        }
    },

    updateProminAutomatedFindingConfig: function(payload) {
        try {
            var grFindingDefConfig = new GlideRecordSecure('promin_automated_finding_configuration');

            var validationUtil = new sn_po.ProminFindingsValidationUtil();
            var validationResponses = [];
            for (var key in payload) {
                grFindingDefConfig.get(key);
                grFindingDefConfig.setValue('configuration_value', payload[key]);
                var validationResponse = validationUtil.validateFindingConfig(grFindingDefConfig);
                if (validationResponse.success == false) {
                    validationResponses.push({
                        configuration: validationResponse.configuration,
                        message: validationResponse.message
                    });
                } else {
                    var id = grFindingDefConfig.update();
                    if (gs.nil(id)) {
                        gs.error("Error while updating automated finding configuration record {0}", key);
                    }
                }
            }
            if (validationResponses.length > 0) {
                return {
                    success: false,
                    message: gs.getMessage('Automated finding configuration updation failed.'),
                    errorMessages: validationResponses
                };
            }

            return {
                success: true,
                message: gs.getMessage('Automated finding configuration updated.'),
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Automated finding configuration updation failed.'),
            };
        }
    },

    updateProminAutomatedFinding: function(sysId, payload) {
        try {
            var grFindingDef = new GlideRecordSecure('promin_automated_finding');

            grFindingDef.get(sysId);
            for (var key in payload) {
                grFindingDef.setValue(key, payload[key]);
            }

            var validationUtil = new sn_po.ProminFindingsValidationUtil();
            var validationResponse = validationUtil.validateFindingDef(grFindingDef, 'update');

            if (!validationResponse.success) {
                return validationResponse;
            }

            var id = grFindingDef.update();
            if (gs.nil(id)) {
                return {
                    success: false,
                    message: gs.getMessage('Finding updation failed.'),
                    status: this.statusMap.error
                };
            }

            return {
                success: true,
                message: gs.getMessage('Automated finding updated.'),
                status: this.statusMap.success
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Finding updation failed.'),
                status: this.statusMap.error
            };
        }
    },

    getRuleBasedFindingFields: function(findingClass, findingClassId) {
        if (findingClass == this.FINDING_CLASS.PROJECT) {
            var grEntities = new GlideRecord('promin_project_entity');
            grEntities.addQuery('project=' + findingClassId);
            grEntities.query();

            var fields = [];

            while (grEntities.next()) {
                var grActivities = new GlideRecord('promin_activity_def');
                grActivities.addQuery('entity=' + grEntities.getUniqueValue());
                grActivities.query();
                var isSourceTypeAgenticAI = grEntities.getValue('source_type') == 'AGENTIC_AI_DATA';
                var table = isSourceTypeAgenticAI ? 'sn_aia_execution_task' : grEntities.getValue('table');
                var tableLabel = '';

                if (grEntities.getValue('source_type') == 'ARCHIVED_DATA' && table.startsWith(this.ARCHIVE_PREFIX)) {
                    var grArchived = new GlideRecord(table);
                    tableLabel = grArchived.getLabel();
                    table = table.substring(this.ARCHIVE_PREFIX.length);
                }
                var grTable = new GlideRecord(table);
                tableLabel = tableLabel || grTable.getLabel();

                var hasMultipleEntities = grEntities.getRowCount() > 1 ? true : false;
                fields.push(
                    this._getProcessStartEndFields(
                        grEntities.getValue('table'),
                        grEntities.getUniqueValue(),
                        hasMultipleEntities
                    )
                );

                while (grActivities.next()) {
                    var isChildOrParentAttached = grActivities.getValue('type') == 'CHILD_ATTACHED' || grActivities.getValue('type') == 'PARENT_ATTACHED' ? true : false;
                    var attachedTableName = '',
                        attachedTableLabel = null;

                    if (isChildOrParentAttached) {
                        var grAttachedTable = new GlideRecord('promin_project_entity');
                        var attchedTable = grActivities.getValue('attached_entity');
                        if (grAttachedTable.get(attchedTable)) {
                            attachedTableName = grAttachedTable.getValue("table");
                            attachedTableLabel = gs.getMessage('{0} attached', [grAttachedTable.name.getDisplayValue()]);
                        }
                    }
                    var field = grActivities.getValue('field');
                    var labelsArray = [];
                    var type = grActivities.getValue('type');
                    if (type == 'COMPOUND') {
                        var compoundFields = field.split(',');
                        if (!isSourceTypeAgenticAI && grActivities.getDisplayValue('display_name') == '') {
                            for (var i = 0; i < compoundFields.length; i++) {
                                try {
                                    var compoundEl = grTable.getElement(compoundFields[i]);
                                    var eld = compoundEl.getED();
                                    labelsArray.push(eld.getLabel());
                                } catch (e) {
                                    // fail silently
                                }
                            }
                        }
                        field = compoundFields[0];
                    }
                    var fieldTable = this._getFieldTable(grEntities.getValue('table'), tableLabel, field, false, isChildOrParentAttached);
                    var referenceTable = !isChildOrParentAttached ? this._getReferenceTable(table, field) : '';

                    var fieldValues = [];
                    var fieldInternalType, fieldIsChoiceTable, fieldLabelValue;
                    if (isSourceTypeAgenticAI || isChildOrParentAttached) {
                        fieldInternalType = this.INTERNAL_TYPES.STRING;
                        fieldIsChoiceTable = false;
                        fieldLabelValue = attachedTableLabel;
                    } else {
                        try {
                            var el = grTable.getElement(field);
                            var ed = el.getED();
                            fieldInternalType = ed.getInternalType();
                            fieldIsChoiceTable = ed.isChoiceTable();
                            fieldLabelValue = ed.getLabel();
                        } catch (e) {
                            // fail silently
                        }
                    }

                    if (fieldInternalType == this.INTERNAL_TYPES.BOOLEAN) {
                        fieldValues = [{
                            id: 'true',
                            label: 'True'
                        }, {
                            id: 'false',
                            label: 'False'
                        }];
                    } else if (fieldIsChoiceTable) {
                        fieldValues = this._getFieldChoices(table, field);
                    }

                    // Only show entity name in brackets if project has more than 1 entity
                    var fieldLabel = grActivities.getDisplayValue('display_name') || fieldLabelValue;

                    if (field && field.split('.').length > 1) {
                        var dotWalkPath = new sn_po.ProminProjectDefUtil().getReferenceFieldLabel(table, field);
                        fieldLabel = dotWalkPath.label;
                    }

                    if (hasMultipleEntities) {
                        fieldLabel += ' (' + fieldTable.label + ')';
                    }
                    var isGrouped = Boolean(parseInt(grActivities.getValue('track_change')));

                    fields.push({
                        id: isChildOrParentAttached ? this._generateUniqueFieldId(grEntities.getUniqueValue(), attchedTable) : this._generateUniqueFieldId(grEntities.getUniqueValue(), type == 'COMPOUND' ? compoundFields.join(',') : field),
                        name: isChildOrParentAttached ? this._generateUniqueFieldId(grEntities.getUniqueValue(), attchedTable) : this._generateUniqueFieldId(grEntities.getUniqueValue(), type == 'COMPOUND' ? compoundFields.join(',') : field),
                        label: (type == 'COMPOUND' && labelsArray.length > 0) ? labelsArray.join(', ') : fieldLabel,
                        fieldTable: fieldTable,
                        referenceTable: referenceTable,
                        isChoiceTable: fieldIsChoiceTable,
                        internalType: fieldInternalType,
                        predicates: this._getPredicatesByField(fieldInternalType, referenceTable, fieldValues.length, isGrouped),
                        values: fieldValues,
                        isStartOrEndField: false,
                        isContextualField: Boolean(parseInt(grActivities.getValue('activity_of_interest'))),
                    });
                }
            }
            return {
                success: true,
                message: gs.getMessage('OK'),
                fields: fields,
            };
        } else if (findingClass == this.FINDING_CLASS.PROCESS) {
            var gr = new GlideRecord('promin_process_def');

            gr.get(findingClassId);

            var configTable = gr.getValue('table');
            if (configTable.startsWith(this.ARCHIVE_PREFIX)) {
                configTable = configTable.substring(this.ARCHIVE_PREFIX.length);
            }

            var allowedColumnsParams = {
                tableName: configTable,
                currentTableName: 'promin_process_def',
                entityId: '',
            };

            var configFieldsResponse = new sn_po.ProminProjectDefUtil().getProminAllowedColumnList(allowedColumnsParams);
            if (!configFieldsResponse.success) {
                return {
                    success: false,
                    message: gs.getMessage('Something went wrong'),
                    fields: [],
                };
            }
            var configFields = configFieldsResponse.fields.filter(function(field) {
                return (field.internalType != 'workflow');
            }).sort(function(a, b) {
                var labelA = a.label.toUpperCase();
                var labelB = b.label.toUpperCase();
                if (labelA < labelB) {
                    return -1;
                }
                if (labelA > labelB) {
                    return 1;
                }
                return 0;
            });
            var outConfigFields = [];

            var grConfigTable = new GlideRecord(configTable);
            var configTableLabel = grConfigTable.getLabel();
            outConfigFields.push(this._getProcessStartEndFields(gr.getValue('table'), findingClassId, false));
            for (var i = 0; i < configFields.length; i += 1) {
                var configFieldName = configFields[i].name;

                var configFieldED = grConfigTable.getElement(configFieldName).getED();

                var configFieldValues = [];
                var configFieldInternalType = configFieldED.getInternalType();
                var configFieldIsChoiceTable = configFieldED.isChoiceTable();
                if (configFieldInternalType == this.INTERNAL_TYPES.BOOLEAN) {
                    configFieldValues = [{
                        id: 'true',
                        label: 'True'
                    }, {
                        id: 'false',
                        label: 'False'
                    }];
                } else if (configFieldIsChoiceTable) {
                    configFieldValues = this._getFieldChoices(configTable, configFieldName);
                }
                var configFieldReferenceTable = this._getReferenceTable(configTable, configFieldName);
                var grouped = configFields[i].internalType === this.INTERNAL_TYPES.DATE_TIME ? true : false;

                outConfigFields.push({
                    id: this._generateUniqueFieldId(findingClassId, configFieldName),
                    name: this._generateUniqueFieldId(findingClassId, configFieldName),
                    label: configFields[i].label,
                    fieldTable: gr.getValue('table'),
                    referenceTable: configFieldReferenceTable,
                    isChoiceTable: configFieldIsChoiceTable,
                    internalType: configFieldInternalType,
                    predicates: this._getPredicatesByField(configFieldInternalType, configFieldReferenceTable, configFieldValues.length, grouped),
                    values: configFieldValues,
                    isStartOrEndField: false,
                    isContextualField: false,
                });
            }
            return {
                success: true,
                message: gs.getMessage('OK'),
                fields: outConfigFields,
            };
        }
        return {
            message: findingClass + " " + findingClassId,
            success: true,
        };
    },

    _generateUniqueFieldId: function(entityId, field) {
        return entityId + "-{:**:}-" + field;
    },

    _getPredicatesByField: function(fieldInternalType, referenceTable, fieldValuesCount, isGrouped) {
        if (isGrouped) {
            return this.PREDICATES.filter(function(item) {
                return item.id === 'ANY';
            });
        }
        if (fieldInternalType === this.INTERNAL_TYPES.INTEGER && !referenceTable && fieldValuesCount === 0) {
            return this.PREDICATES.filter(function(item) {
                return item.fieldType === 'single' || item.fieldType === 'none';
            });
        }
        return this.PREDICATES;
    },

    _getFieldChoices: function(table, field) {
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
                    id: choiceList.getChoice(j).getValue(),
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

    _getFieldTable: function(rootTableName, rootTableLabel, inputField, endFieldTableRef, isChildOrParentAttached) {
        if (!inputField && isChildOrParentAttached) {
            return {
                name: rootTableName,
                label: rootTableLabel,
            };
        }
        var field = '';
        var table = rootTableName;
        var label = rootTableLabel;
        var fieldList = inputField.split('.');

        if (fieldList.length < 2) {
            return {
                name: table,
                label: label,
            };
        } else {
            var fieldListLength = endFieldTableRef ? fieldList.length : fieldList.length - 1;
            for (var i = 0; i < fieldListLength; i++) {
                var gr = new GlideRecord(table);
                gr.query();
                if (gr.next() && gr[fieldList[i]].getRefRecord() != undefined && gr[fieldList[i]].getRefRecord().getTableName() != undefined) {
                    table = gr[fieldList[i]].getRefRecord().getTableName();
                    field = fieldList[i + 1];
                    var grTable = new GlideRecord(table);
                    label = grTable.getLabel();
                }
            }
            return {
                name: table,
                label: label,
            };
        }
    },

    _getProcessStartEndFields: function(table, entityId, showTableLabel) {
        var fieldLabel = gs.getMessage('Process start - end');

        var gr = new GlideRecord(table);
        var tableLabel = gr.getLabel();

        if (showTableLabel) {

            fieldLabel += ' (' + tableLabel + ')';
        }

        return {
            id: this._generateUniqueFieldId(entityId, 'PROCESS-START-END'),
            name: this._generateUniqueFieldId(entityId, 'PROCESS-START-END'),
            label: fieldLabel,
            fieldTable: {
                name: table,
                label: tableLabel,
            },
            isChoiceTable: false,
            internalType: 'string',
            predicates: [{
                id: 'EQ',
                value: 'EQ',
                label: gs.getMessage('is'),
                fieldType: 'single',
            }],
            values: [{
                    id: 'START',
                    label: gs.getMessage('Process start')
                },
                {
                    id: 'END',
                    label: gs.getMessage('Process end')
                },
            ],
            isStartOrEndField: true,
        };
    },

    getReferenceValuesLabels: function(table, values, field) {
        try {
            var valuesWithLabels = [];
            var gr = new GlideRecordSecure(table);

            if (!field) {
                for (var i = 0; i < values.length; i += 1) {
                    if (gr.get(values[i])) {
                        valuesWithLabels.push({
                            id: gr.getUniqueValue(),
                            label: gr.getDisplayValue(),
                        });
                    }
                }
            } else if (field && values.length > 0) {
                gr.addQuery(field, 'IN', values);
                gr.query();

                while (gr.next()) {
                    valuesWithLabels.push({
                        id: gr.getValue(field),
                        label: gr.getDisplayValue(),
                    });
                }
            }

            return {
                success: true,
                values: valuesWithLabels,
            };
        } catch (err) {
            return {
                success: false,
                values: [],
            };
        }
    },

    getReferenceItems: function(table, searchTerm, limit, queryConditions, matchStrategy, field) {
        try {
            var items = [];
            if (!searchTerm) {
                searchTerm = "";
            }
            if (!limit) {
                limit = 15;
            }

            if (!matchStrategy) {
                matchStrategy = 'STARTSWITH';
            }

            var gr = new GlideRecordSecure(table);
            var displayField = gr.getDisplayName();
            this._applyQueryFilters(gr, displayField, matchStrategy, searchTerm, queryConditions, field);
            gr.orderBy(displayField);
            gr.setLimit(limit);
            gr.query();

            while (gr.next()) {
                items.push({
                    id: !field ? gr.getUniqueValue() : gr.getValue(field),
                    label: gr.getDisplayValue(),
                });
            }

            // Calculate row count
            var ga = new GlideAggregate(table);
            this._applyQueryFilters(ga, displayField, matchStrategy, searchTerm, queryConditions, field);
            ga.query();
            var rowCount = ga.getRowCount();

            return {
                success: true,
                items: items,
                rowCount: rowCount,
            };
        } catch (err) {
            return {
                success: false,
                items: [],
                rowCount: 0,
            };
        }

    },

    _applyQueryFilters: function(queryObject, displayField, matchStrategy, searchTerm, queryConditions, field) {
        queryObject.addEncodedQuery(displayField + matchStrategy + searchTerm);
        if (queryConditions) {
            queryObject.addEncodedQuery(queryConditions);
        }
        if (field) {
            queryObject.addNotNullQuery(field);
        }
    },

    createRuleBasedFinding: function(payload) {
        try {
            var grFindingDef = new GlideRecordSecure('promin_finding_def');
            grFindingDef.initialize();

            for (var key in payload) {
                grFindingDef.setValue(key, payload[key]);
            }

            var newFindingId = grFindingDef.insert();
            if (gs.nil(newFindingId)) {
                return {
                    success: false,
                    message: gs.getMessage('Rule based finding creation failed.'),
                    findingId: '',
                    status: this.statusMap.error
                };
            }
            return {
                success: true,
                message: gs.getMessage('Improvement opportunity definition created. You can now configure steps that form a specific pattern.'),
                findingId: newFindingId,
                status: this.statusMap.success
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Rule based finding creation failed.'),
                findingId: '',
                status: this.statusMap.error
            };
        }
    },

    getFindingRulesAndConstraints: function(findingDefId) {
        // Chains
        var chains = [];
        var hasMultipleEntities = false;

        var grFindingDefChain = new GlideRecord('promin_finding_def_chain');
        grFindingDefChain.addEncodedQuery('finding_def=' + findingDefId);
        grFindingDefChain.orderBy('chain');
        grFindingDefChain.query();
        var grFindingDef = new GlideRecord('promin_finding_def');
        if (grFindingDef.get(findingDefId)) {
            var grEntities = new GlideRecord('promin_project_entity');
            if (grFindingDef.project) {
                grEntities.addQuery('project', grFindingDef.project);
                grEntities.query();
                hasMultipleEntities = grEntities.getRowCount() > 1 ? true : false;
            }
        }

        while (grFindingDefChain.next()) {
            // Rules
            var findingRules = [];

            var grFindingDefRule = new GlideRecord('promin_finding_def_rule');
            grFindingDefRule.addQuery('finding_chain=' + grFindingDefChain.getUniqueValue());
            grFindingDefRule.orderBy('sequence');
            grFindingDefRule.query();


            while (grFindingDefRule.next()) {
                var trackDuration;
                if (grFindingDefRule.getValue('track_time') == "1") {
                    trackDuration = true;
                } else if (grFindingDefRule.getValue('track_time') == "0") {
                    trackDuration = false;
                }

                findingRules.push({
                    id: grFindingDefRule.getUniqueValue(),
                    startCondition: this._getFindingCondition(grFindingDefRule.getValue('source_condition')),
                    endCondition: this._getFindingCondition(grFindingDefRule.getValue('sink_condition')),
                    relation: grFindingDefRule.getValue('relation'),
                    chain: grFindingDefChain.getValue('chain'),
                    sequence: grFindingDefRule.getValue('sequence'),
                    trackDuration: trackDuration,
                });
            }

            // Constraints
            var nodeToNodeConstraints = [];

            var grFindingDefConstraint = new GlideRecord('promin_finding_def_constraint');
            grFindingDefConstraint.addQuery('finding_chain=' + grFindingDefChain.getUniqueValue());
            grFindingDefConstraint.addQuery('criteria', 'NODE_TO_NODE');
            grFindingDefConstraint.orderBy('sys_created_on');
            grFindingDefConstraint.query();


            while (grFindingDefConstraint.next()) {
                var grFindingDefCondition = new GlideRecord('promin_finding_def_condition');
                grFindingDefCondition.get(grFindingDefConstraint.getValue('source_condition'));
                var table = grFindingDefCondition.getValue('table');
                var grTable = new GlideRecord(table);
                var field = grFindingDefConstraint.getValue('relation_constraint_field');
                var fieldLabel = '';
                if (grTable.isValidField(field)) {
                    var ed = grTable.getElement(field).getED();
                    fieldLabel = ed.getLabel();
                }
                // For dot walked fields
                if (field && field.split('.').length > 1) {
                    var dotWalkPath = new sn_po.ProminProjectDefUtil().getReferenceFieldLabel(table, field);
                    fieldLabel = dotWalkPath.label;
                }
                var tableLabel = grTable.getLabel();
                if (fieldLabel && hasMultipleEntities) {
                    fieldLabel += ' (' + tableLabel + ')';
                }
                var constraint = {
                    id: grFindingDefConstraint.getUniqueValue(),
                    name: grFindingDefConstraint.getValue('name'),
                    min: !gs.nil(grFindingDefConstraint.getValue('min')) ?
                        Number(grFindingDefConstraint.getValue('min')) : undefined,
                    max: !gs.nil(grFindingDefConstraint.getValue('max')) ?
                        Number(grFindingDefConstraint.getValue('max')) : undefined,
                    type: grFindingDefConstraint.getValue('relation_constraint'),
                    field: grFindingDefConstraint.getValue('relation_constraint_field'),
                    fieldLabel: fieldLabel,
                    startConditionId: this._getSingleConditionId(grFindingDefConstraint.getValue('source_condition')),
                    endConditionId: this._getSingleConditionId(grFindingDefConstraint.getValue('sink_condition')),
                };

                if (constraint.type == 'DURATION') {
                    if (!gs.nil(constraint.min)) {
                        constraint.min = constraint.min / 1000;
                    }
                    if (!gs.nil(constraint.max)) {
                        constraint.max = constraint.max / 1000;
                    }
                }

                nodeToNodeConstraints.push(constraint);
            }

            chains.push({
                chain: grFindingDefChain.getValue('chain'),
                includePath: grFindingDefChain.getValue('match_mode') == 'INCLUDE' ? true : false,
                rules: JSON.stringify(findingRules),
                nodeToNodeConstraints: JSON.stringify(nodeToNodeConstraints),
            });
        }

        // View config
        var viewConfig = 'DEFAULT';

        if (grFindingDef.get(findingDefId)) {
            viewConfig = grFindingDef.getValue('view_config');
        }

        return {
            success: true,
            chains: chains,
            viewConfig: viewConfig,
        };
    },

    _getSingleConditionId: function(conditionId) {
        var grFindingDefCondition = new GlideRecord('promin_finding_def_condition');
        grFindingDefCondition.get(conditionId);
        if (grFindingDefCondition.getValue('sub_type') == 'SINGLE') {
            return conditionId;
        } else if (grFindingDefCondition.getValue('sub_type') == 'OR') {
            var leftConditionId = this._getSingleConditionId(grFindingDefCondition.getValue('left'));
            if (!gs.nil(leftConditionId)) {
                return leftConditionId;
            }
            return this._getSingleConditionId(grFindingDefCondition.getValue('right'));
        }

        return null;
    },

    _getFindingCondition: function(conditionId, rootTable) {
        var grFindingDefCondition = new GlideRecord('promin_finding_def_condition');
        grFindingDefCondition.get(conditionId);
        var table = rootTable || grFindingDefCondition.getValue('table');
        var grTable = new GlideRecord(table);
        var tableLabel = grTable.getLabel();
        var hasMultipleEntities = false;
        var field = grFindingDefCondition.getValue('field') || '';
        var type = grFindingDefCondition.getValue('type');
        var fieldLabel = '';
        var projectId = '';
        if (grFindingDefCondition.entity && grFindingDefCondition.entity.project) {
            projectId = grFindingDefCondition.entity.project;
            if (projectId) {
                var grEntity = new GlideRecord('promin_project_entity');
                grEntity.addQuery('project', projectId);
                grEntity.query();
                hasMultipleEntities = grEntity.getRowCount() > 1 ? true : false;
            }
        }
        if (grTable.isValidField(field)) {
            var ed = grTable.getElement(field).getED();
            fieldLabel = ed.getLabel();
        } else {
            // For parent and child attached fields
            if (projectId) {
                while (grEntity.next()) {
                    if (grEntity.getUniqueValue() == field) {
                        fieldLabel = gs.getMessage('{0} attached', [grEntity.getValue('name')]);
                        break;
                    }
                }
            }
        }
        // For compound activity fields
        if (field && field.contains(',')) {
            var compoundFields = field.split(',');
            var labelsArray = [];
            for (var i = 0; i < compoundFields.length; i++) {
                try {
                    var compoundEl = grTable.getElement(compoundFields[i]);
                    var eld = compoundEl.getED();
                    labelsArray.push(eld.getLabel());
                } catch (e) {
                    // fail silently
                }
            }
            fieldLabel = labelsArray.join(', ');
        }
        // For dot walked fields
        if (field && field.split('.').length > 1) {
            var dotWalkPath = new sn_po.ProminProjectDefUtil().getReferenceFieldLabel(table, field);
            fieldLabel = dotWalkPath.label;
        }
        if (type == 'START' || type == 'END') {
            fieldLabel = gs.getMessage('Process Start - End');
        }
        if (fieldLabel && hasMultipleEntities) {
            fieldLabel += ' (' + tableLabel + ')';
        }
        var nodeConstraints = [];

        var grNodeConstraints = new GlideRecord('promin_finding_def_constraint');
        grNodeConstraints.addQuery('sink_conditionISEMPTY^source_condition.sys_id=' + conditionId);
        grNodeConstraints.query();

        while (grNodeConstraints.next()) {
            var rawValues = grNodeConstraints.getValue('value');

            var nc = {
                type: grNodeConstraints.getValue('relation_constraint'),
                min: !gs.nil(grNodeConstraints.getValue('min')) ?
                    Number(grNodeConstraints.getValue('min')) : undefined,
                max: !gs.nil(grNodeConstraints.getValue('max')) ?
                    Number(grNodeConstraints.getValue('max')) : undefined,
                values: rawValues && rawValues.length > 0 ?
                    rawValues.split(',') : [],
                name: grNodeConstraints.getValue('name'),
                startConditionId: conditionId,
            };


            if (nc.type == 'DURATION') {
                if (!gs.nil(nc.min)) {
                    nc.min = nc.min / 1000;
                }
                if (!gs.nil(nc.max)) {
                    nc.max = nc.max / 1000;
                }
            }

            nodeConstraints.push(nc);
        }

        var condition = {
            id: grFindingDefCondition.getUniqueValue(),
            entityId: grFindingDefCondition.getValue('entity'),
            kind: grFindingDefCondition.getValue('type'),
            subType: grFindingDefCondition.getValue('sub_type'),
            field: grFindingDefCondition.getValue('field'),
            fieldLabel: fieldLabel,
            table: table,
            tableLabel: tableLabel,
            fieldDisplayValue: grFindingDefCondition.getValue('field_display_value'),
            values: !gs.nil(grFindingDefCondition.getValue('field_value')) ? grFindingDefCondition.getValue('field_value').split(',') : [],
            predicate: grFindingDefCondition.getValue('predicate'),
            occurrence: grFindingDefCondition.getValue('occurrence'),
            context: null,
            left: null,
            right: null,
            nodeConstraints: nodeConstraints,
        };
        if (!gs.nil(grFindingDefCondition.getValue('context'))) {
            condition.context = this._getFindingCondition(grFindingDefCondition.getValue('context'), table);
        }
        if (grFindingDefCondition.getValue('sub_type') == 'OR' || grFindingDefCondition.getValue('sub_type') == 'AND') {
            condition.left = this._getFindingCondition(grFindingDefCondition.getValue('left'));
            condition.right = this._getFindingCondition(grFindingDefCondition.getValue('right'));
        }

        return condition;
    },

    updateRuleBasedFinding: function(sysId, payload) {
        try {
            var grFindingDef = new GlideRecordSecure('promin_finding_def');
            grFindingDef.get(sysId);
            for (var key in payload) {
                grFindingDef.setValue(key, payload[key]);
            }

            var id = grFindingDef.update();
            if (gs.nil(id)) {
                return {
                    success: false,
                    message: gs.getMessage('Finding definition updation failed.'),
                    status: this.statusMap.error
                };
            }

            return {
                success: true,
                message: gs.getMessage('Finding definition updated.'),
                status: this.statusMap.success
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Finding definition updation failed.'),
                status: this.statusMap.error
            };
        }
    },

    /**
     * Copy rule based finding definition. Creates a new finding definition with the same configuration as the original.
     * Intended to be used ONLY for rule based finding definitions, because of the special logic of copying conditions.
     * The name of the new finding definition is the same as the original, but with "Copy of " prefix appended to it.
     * @param {string} sysId - The sys_id of the finding definition to copy.
     * @returns {{success: boolean, message: string, findingId: string, status: string}} - An object containing the success status, message, and finding ID.
     */
    copyRuleBasedFinding: function(sysId) {
        try {
            var grFindingDef = new GlideRecordSecure('promin_finding_def');
            if (!grFindingDef.get(sysId)) {
                throw new Error('Finding definition not found.');
            }

            if (!grFindingDef.canCreate()) {
                throw new Error('Permission denied to copy finding definition.');
            }

            var grNewFindingDef = new global.ProminUIAction().copyFindingConfig(grFindingDef);
            return {
                success: true,
                message: gs.getMessage('Copy of finding definition created successfully.'),
                findingId: grNewFindingDef.getUniqueValue(),
                status: this.statusMap.success,
            };
        } catch (err) {
            gs.error("Error while copying finding definition", err);
            return {
                success: false,
                message: gs.getMessage('Finding definition copy failed.'),
                status: this.statusMap.error,
            };
        }
    },

    // Public wrapper around _getReferenceTable so sibling Script Includes can resolve a reference table.
    getReferenceTableForField: function(tableName, fieldName) {
        return this._getReferenceTable(tableName, fieldName);
    },

    _getReferenceTable: function(tableName, fieldName) {
        var referenceTable = '';
        var gr = new GlideRecord(tableName);

        if (!gr.isValid()) {
            return '';
        }
        if (fieldName.split('.').length == 1 && !gr.isValidField(fieldName)) {
            return '';
        }

        var element = gr.getElement(fieldName);
        var ed = element.getED();

        if (ed.getInternalType() != 'reference') {
            return '';
        }
        if (fieldName.split('.').length > 1) {
            var response = this._getFieldTable(tableName, gr.getLabel(), fieldName, true, false);
            return response.name;
        }

        return element.getReferenceTable();
    },

    type: 'ProminFindingsDefUtilSNC'
};

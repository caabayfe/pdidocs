var PDActivityRepository = Class.create();
PDActivityRepository.prototype = {
    initialize: function() {
        this.flowDataDefinitionService;
        this.activityDefinitionRepo = new PDActivityDefinitionRepository();
    },
    type: 'PDActivityRepository',

    _getFlowDataDefinitionService: function() {
        if (!this.flowDataDefinitionService)
            this.flowDataDefinitionService = new PDFlowDataDefinitionService();
        return this.flowDataDefinitionService;
    },

    insertActivities: function(activities, config) {
        var insertedActivities = activities.map(function(fields) {
            return this.insertActivity(fields, config);
        }.bind(this));
        this._addVariableValuesToActivities(insertedActivities, config);
        return insertedActivities;
    },

    insertActivity: function(fields, config) {
        fields = fields || {};
        var gr = PDUtils.newGlideRecordWithSkipProcessUpdate(PDConstants.TABLES.PD_ACTIVITY);
        gr.initialize();
        var rawActivityUtil = new PDRawActivityUtil();
        rawActivityUtil.processActivity(fields);
        var processDefinition = fields['processDefinition'];
        var activityDefinition = fields['activityDefinition'];
        var label = fields['label'];
        var lane = fields['lane'];
        if (!processDefinition || !activityDefinition || !label)
            throw (gs.getMessage(
                'Missing one or more of required fields: processDefinition, activityDefinition, label'));
        // the user can optionally pass in a sysId to hardcode the record to
        var sysId = fields['sysId'];
        if (sysId)
            gr.setNewGuidValue(sysId);

        var startDelay = fields['startDelay'];
        startDelay = PDUtils.updateStartWithDelay(startDelay);

        this._setFieldsOnGr(fields, gr, false);

        var insertedId = gr.insert();

        if (!insertedId) {
            var errorRecordId = sysId || '';
            throw gs.getMessage('Unable to insert activity {0}: {1}', [errorRecordId, gr.getLastErrorMessage()]);
        }

        var insertedGr = this.get(insertedId);

        // an activity record has to be inserted and saved first before updating its inputs
        // because inputs don't exist on the activity until the activity has been inserted and the activity definition is set.
        // The inputs are inherited from the activity definition, so we don't have them until the activity definition is set.
        if (fields.inputs)
            this._handleGlideElementGlideVarChanges(
                fields.inputs, insertedGr, PDConstants.FIELDS.INPUTS);
        if (fields.typeVals)
            this._handleGlideElementGlideVarChanges(
                fields.typeVals, insertedGr, PDConstants.FIELDS.TYPE_VALS);

        rawActivityUtil.processInputs(insertedGr);
        var activity = this._getActivityFromGR(insertedGr, startDelay, config);

        var padGCFCollector = new PADGCFCollector();
        if (activity.variant.value) {
            padGCFCollector.recordProcessUsageEvent(padGCFCollector.processEvents.VARIANT_ACTIVITY_CREATED, 0);
        }
        if (activity.activity_definition.value === PDConstants.ACTIVITY_DEFINITION_IDS.DECISION && PDUtils.isDecisionStage(insertedGr)) {
            padGCFCollector.recordProcessUsageEvent(padGCFCollector.processEvents.DECISION_STAGE_ADDED, 0);
        }
        return activity;
    },

    updateActivities: function(activities, processSchemaVersion, config) {
        var updatedActivities = activities.map(function(fields) {
            var copiedFields = PDUtils.shallowClone(fields);
            copiedFields.processSchemaVersion = processSchemaVersion;
            return this.updateActivity(copiedFields, config);
        }.bind(this));
        this._addVariableValuesToActivities(updatedActivities, config);
        return updatedActivities;
    },

    updateActivity: function(fields, config) {
        fields = fields || {};

        var sysId = fields['sysId'];

        if (!sysId)
            throw (gs.getMessage('Missing required field: sysId'));

        var startDelay = fields['startDelay'];
        startDelay = PDUtils.updateStartWithDelay(startDelay, sysId);

        var activityGr = this.get(sysId);
        var rawActivityUtil = new PDRawActivityUtil();
        rawActivityUtil.processActivity(fields);
        if (!activityGr)
            throw (gs.getMessage('Unable to find activity with id: {0}', sysId));

        if (gs.nil(fields['processDefinition']))
            fields['processDefinition'] = activityGr.getValue('process_definition');

        this._setFieldsOnGr(fields, activityGr, true);

        if (!activityGr.update())
            throw gs.getMessage('Unable to update activity {0}: {1}', [sysId, activityGr.getLastErrorMessage()]);
        if (fields['activityActionOverrides'] !== undefined)
            this._saveActivityActionOverrides(sysId, fields['activityActionOverrides']);
        rawActivityUtil.processInputs(activityGr);
        var activity = this._getActivityFromGR(activityGr, startDelay, config);
        return activity;
    },

    _saveActivityActionOverrides: function(activityId, overrides) {
        var existingGr = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY_ACTION_OVERRIDE);
        existingGr.addQuery(PDConstants.FIELDS.ACTIVITY, activityId);
        existingGr.query();

        var existingByAssignment = {};
        while (existingGr.next()) {
            var assignmentId = existingGr.getValue(PDConstants.FIELDS.ACTION_ASSIGNMENT);
            existingByAssignment[assignmentId] = existingGr.getUniqueValue();
        }

        var incomingAssignmentIds = {};
        var overrideList = overrides || [];
        for (var i = 0; i < overrideList.length; i++) {
            var override = overrideList[i];
            var assignmentId = override.actionAssignmentId;
            if (!assignmentId) continue;
            incomingAssignmentIds[assignmentId] = true;

            if (existingByAssignment[assignmentId]) {
                var updateGr = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY_ACTION_OVERRIDE);
                if (updateGr.get(existingByAssignment[assignmentId])) {
                    updateGr.setValue(PDConstants.FIELDS.LABEL, override.label);
                    updateGr.setValue(PDConstants.FIELDS.DISPLAY_ORDER, override.displayOrder);
                    updateGr.update();
                }
            } else {
                var insertGr = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY_ACTION_OVERRIDE);
                insertGr.initialize();
                insertGr.setValue(PDConstants.FIELDS.ACTIVITY, activityId);
                insertGr.setValue(PDConstants.FIELDS.ACTION_ASSIGNMENT, assignmentId);
                insertGr.setValue(PDConstants.FIELDS.LABEL, override.label);
                insertGr.setValue(PDConstants.FIELDS.DISPLAY_ORDER, override.displayOrder);
                insertGr.insert();
            }
        }

        // Delete override rows no longer in the incoming list
        var deleteGr = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY_ACTION_OVERRIDE);
        deleteGr.addQuery(PDConstants.FIELDS.ACTIVITY, activityId);
        deleteGr.query();
        while (deleteGr.next()) {
            if (!incomingAssignmentIds[deleteGr.getValue(PDConstants.FIELDS.ACTION_ASSIGNMENT)])
                deleteGr.deleteRecord();
        }
    },

    // activitiesStr: a string of activity Ids separated by ,
    deleteActivities: function(activitiesStr) {
        if (!activitiesStr || activitiesStr.length === 0)
            throw (gs.getMessage('No activity to delete'));

        var gr = PDUtils.newGlideRecordWithSkipProcessUpdate(PDConstants.TABLES.PD_ACTIVITY);
        gr.addQuery('sys_id', 'IN', activitiesStr);
        gr.query();
        gr.deleteMultiple();
    },

    get: function(sysId) {
        var gr = PDUtils.newGlideRecordWithSkipProcessUpdate(PDConstants.TABLES.PD_ACTIVITY);
        gr.get(sysId);

        if (gr.isValidRecord())
            return gr;

        return null;
    },

    _setFieldsOnGr: function(fields, gr, includeGlideVars) {
        gr[PDConstants.FIELDS.PROCESS_SCHEMA_VERSION] = fields['processSchemaVersion']; //gr.setValue doesn't work here because process_schema_version is not a valid field
        for (var fieldName in fields) {
            var fieldValue = fields[fieldName];
            var snakeCaseFieldName = PDUtils.camelcaseToSnakecase(fieldName);
            switch (snakeCaseFieldName) {
                case PDConstants.FIELDS.SYS_ID: //we never want to set the sys id of an update
                    break;
                case PDConstants.FIELDS.INPUTS:
                case PDConstants.FIELDS.TYPE_VALS:
                    if (includeGlideVars)
                        this._handleGlideElementGlideVarChanges(fieldValue, gr, snakeCaseFieldName);
                    break;
                case PDConstants.FIELDS.START_RULE:
                    PDUtils.handleStartRuleChange(fieldValue, gr);
                    break;
                case PDConstants.FIELDS.DATA_DEFINITION:
                    this._handleDataDefinitionChange(fieldValue, fields, gr);
                    break;
                case PDConstants.FIELDS.PROCESS_SCHEMA_VERSION:
                    break;
                case PDConstants.FIELDS.AI_AGENT_FIELDS:
                    if (gs.getProperty(PDConstants.ENABLE_AGENTIC_PLAYBOOK) === 'true') {
                        this._handleAiAgentFields(fieldValue, gr);
                    }
                    break;
                case PDConstants.FIELDS.ACTIVITY_ACTION_OVERRIDES:
                    break; // handled separately after update
                default:
                    PDUtils.setGlideRecordFieldValue(gr, snakeCaseFieldName, fieldValue);
            }
        }
    },

    _handleAiAgentFields: function(fieldValue, gr) {
        if (fieldValue.aiAgentObjective !== undefined) {
            gr.setValue(PDConstants.FIELDS.AI_AGENT_OBJECTIVE, fieldValue.aiAgentObjective.value);
        }
        if (fieldValue.aiAgentAutonomousObjective !== undefined) {
            gr.setValue(
                PDConstants.FIELDS.AI_AGENT_AUTONOMOUS_OBJECTIVE,
                fieldValue.aiAgentAutonomousObjective.value
            );
        }
        if (fieldValue.aiAgentRunAs !== undefined) {
            gr.setValue(PDConstants.FIELDS.AI_AGENT_RUN_AS, fieldValue.aiAgentRunAs.value);
        }
        if (fieldValue.aiAgentUser !== undefined) {
            gr.setValue(PDConstants.FIELDS.AI_AGENT_USER, fieldValue.aiAgentUser.value);
        }
        if (fieldValue.enableAiAgent !== undefined) {
            gr.setValue(PDConstants.FIELDS.ENABLE_AI_AGENT, fieldValue.enableAiAgent);
        }
        if (fieldValue.aiAgentExecutionMode !== undefined) {
            gr.setValue(PDConstants.FIELDS.AI_AGENT_ACTIVITY_AUTO_COMPLETE, fieldValue.aiAgentExecutionMode.value);
        }
        if (fieldValue.childAgents) {
            gr.setValue(PDConstants.FIELDS.CONVERSATIONAL_AGENTS, fieldValue.childAgents.value);
        }
        if (fieldValue.launchAgentOnDemand !== undefined) {
            gr.setValue(PDConstants.FIELDS.LAUNCH_AGENT_ON_DEMAND, fieldValue.launchAgentOnDemand);
        }
    },

    _handleDataDefinitionChange: function(fieldValue, fields, gr) {
        var newDataDefinition = fields['dataDefinition'];
        var dataDefinitionSysId = fieldValue['sysId'];
        var dataDefinitionInput = ((fields.inputs || {}).variables || []).find(function(input) {
            return input.variableName === PDConstants.FIELDS.DATA_DEFINITION;
        });
        var dataDefinitionInputValue = dataDefinitionInput ? dataDefinitionInput.variableValue : gr.inputs[PDConstants.FIELDS.DATA_DEFINITION];
        var inputExists = !gs.nil(dataDefinitionInputValue);
        var sysIdExists = !gs.nil(dataDefinitionSysId);

        // if dataDefintion is empty and inputs data definition has no value (user didn't click "Create Questionnaire button"), just return
        var additionalFunctionality = PDUtils.getAdditionalFunctionality(gr);
        if ((!inputExists && !sysIdExists) || additionalFunctionality !== PDConstants.ADDITIONAL_FUNCTIONALITY_TYPE.QUESTIONNAIRE)
            return;

        // Shouldn't happen but if it ever does, return error
        if (inputExists && sysIdExists && dataDefinitionInputValue !== dataDefinitionSysId)
            throw gs.getMessage('Data definition value and activity inputs value mismatch');

        // if input variable data definition exists, BUT dataDefinition sysId doesn't, it means we need to delete the dataDefinition
        /* Deleting the flow data definition -- e.g on UI user clicks 3 dot dropdown and clicks delete (delete all questions)
        This is an 'update' on the activity. Note: deleting an entire activity will achieve the same effect and rules, but will be handled in the business rule.
        */
        if (inputExists && !sysIdExists) {
            this._setFieldsInputsDataDefinition(fields, '');
            return PDUtils.deleteFlowDataDefinition(dataDefinitionInputValue);
        }

        // if flow data def doesn't exist, we need to hit the flowDataDefinitionRepository to create the record
        if (!inputExists && sysIdExists) {
            var nameField = {
                name: fieldValue[PDConstants.FIELDS.NAME],
                sysId: dataDefinitionSysId,
                processDefinition: fields['processDefinition']
            };

            var flowDataDefinitionResult = this._getFlowDataDefinitionService().insertFlowDataDefinition(nameField);
            if (!flowDataDefinitionResult[PDConstants.FIELDS.SYS_ID])
                throw (gs.getMessage('Error adding flow data definition'));

            // update the fields.inputs.data_definition with the new data definition sysId
            // _handleGlideElementGlideVarChanges will handle updating the activity record
            this._setFieldsInputsDataDefinition(fields, dataDefinitionSysId);
        }
        var flowDataDefinitionGr = new GlideRecord(PDConstants.TABLES.FLOW_DATA_DEFINITION);
        flowDataDefinitionGr.get(dataDefinitionSysId);

        // Add conditional check if a snapshot already exists. If it does, we'll need to copy the sys_flow_data_definition and point it to the new one
        // DEF0593622 Note: One would expect that the flow data variables would also need to be copied, but updateFlowDataVariables(newDataDefintion)
        // will do it for us because the name (var__m_sys_flow_data_def_<dataDefinitionSysId>) will be different
        if (!gs.nil(flowDataDefinitionGr.getValue(PDConstants.FIELDS.PROCESS_SNAPSHOT))) {
            // remove process definition snapshot from original dd since the copy will be the newly associated dd
            flowDataDefinitionGr.setValue('process_definition', '');
            flowDataDefinitionGr.update();

            // make a copy
            flowDataDefinitionGr.setValue('sys_id', gs.generateGUID());
            flowDataDefinitionGr.setValue('process_definition', fields['processDefinition']);
            flowDataDefinitionGr.setValue('process_snapshot', '');
            var dataDefCopyGrId = flowDataDefinitionGr.insert();

            // update Activity input dd sysId
            this._setFieldsInputsDataDefinition(fields, dataDefCopyGrId);

            newDataDefinition.sysId = dataDefCopyGrId;
        }

        // Handle the addition/edit/deletion of the glide variables
        return this._getFlowDataDefinitionService().updateFlowDataVariables(newDataDefinition, dataDefinitionSysId);
    },

    _handleGlideElementGlideVarChanges: function(glideElementGlideVars, activityGr, fieldName) {
        if (!((glideElementGlideVars || {}).variables || {}).length)
            return;

        glideElementGlideVars.variables.forEach(function(variable) {
            var variableElement = activityGr.getElement(fieldName + '.' + variable.variableName);
            variableElement.setValue(variable.variableValue || '');
            variableElement.setValueMapping(variable.variableMapping || '');
        });
        activityGr.update();
    },

    _setFieldsInputsDataDefinition: function(fields, sysId) {
        var inputs = fields[PDConstants.FIELDS.INPUTS].variables;
        var dataDefinitionField = inputs.find(function(input) {
            return input.variableName === PDConstants.FIELDS.DATA_DEFINITION;
        });
        dataDefinitionField.variableValue = sysId;
        dataDefinitionField.value = sysId;
    },

    getActivity: function(activityId, config) {
        if (!activityId) {
            throw (gs.getMessage('Missing required parameter: activityId'));
        }

        var gr = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY);
        gr.get(activityId);

        if (!gr.isValidRecord()) {
            throw (gs.getMessage('Could not get activity {0}: {1}', [activityId, gr.getLastErrorMessage()]));
        }

        var activity = this._getActivityFromGR(gr, undefined, config);
        this._addVariableValuesToActivities([activity], config);
        activity.activity_action_overrides = this._getActivityActionOverrides(activityId);
        return activity;
    },

    _getActivityActionOverrides: function(activityId) {
        var overrides = [];
        var gr = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY_ACTION_OVERRIDE);
        gr.addQuery(PDConstants.FIELDS.ACTIVITY, activityId);
        gr.orderBy(PDConstants.FIELDS.DISPLAY_ORDER);
        gr.query();
        while (gr.next()) {
            overrides.push({
                action_assignment_id: gr.getValue(PDConstants.FIELDS.ACTION_ASSIGNMENT),
                label: gr.getValue(PDConstants.FIELDS.LABEL),
                display_order: gr.getValue(PDConstants.FIELDS.DISPLAY_ORDER)
            });
        }
        return overrides;
    },

    getActivitiesByProcessDefinition: function(processDefinitionId, config) {
        if (!processDefinitionId)
            throw (gs.getMessage('Missing required parameter: processDefinitionId'));

        var gr = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY);
        gr.addQuery(PDConstants.FIELDS.PROCESS_DEFINITION, processDefinitionId);
        gr.addEncodedQuery('labelNOT LIKE$end^labelNOT LIKE$start^labelNOT LIKE$restart');
        gr.query();

        var activities = [];
        while (gr.next()) {
            activities.push(this._getActivityFromGR(gr, undefined, config));
        }
        this._addVariableValuesToActivities(activities, config);
        return activities;
    },

    _addVariableValuesToActivities: function(activities, config) {
        if (activities.length == 0 || !config || config.includeVarMeta === undefined || config.includeVarMeta) {
            return;
        }

        var variableValues = new GlideRecord('sys_variable_value');
        var elementMappings = new GlideRecord('sys_element_mapping');
        this._queryVariableValueTables(variableValues, elementMappings, activities);

        var variableMap = {};
        while (variableValues.next()) {
            this._addVariableValueEntry(
                variableMap,
                variableValues.document_key,
                variableValues.variable.name,
                variableValues.variable.element,
                variableValues.value,
                ""
            );
        }
        while (elementMappings.next()) {
            this._addVariableValueEntry(
                variableMap,
                elementMappings.id,
                elementMappings.table,
                elementMappings.field,
                "",
                elementMappings.value
            )
        }

        var getStartRuleVarValue = this._getStartRuleVarValue;
        activities.forEach(function(activity) {
            var variableTypes = variableMap[activity.sys_id.value];
            var startRuleActivities = (variableTypes.startRule && variableTypes.startRule.activities && variableTypes.startRule.activities.value) || [];
            var startRuleBranches = (variableTypes.startRule && variableTypes.startRule.branches && variableTypes.startRule.branches.value) || [];
            var startRuleVarValue = getStartRuleVarValue(startRuleActivities, startRuleBranches);
            activity.start_rule.vars = {
                activities: startRuleVarValue.startRuleActivities,
                branches: startRuleVarValue.startRuleBranches
            };
            activity.inputs.variables = PDUtils.objectValues(variableTypes.inputs);
            activity.type_vals.variables = PDUtils.objectValues(variableTypes.type_vals);
            //To be removed to deprecate start rule V2 Schema
            activity.start_rule = PDUtils.addStartRuleV2Schema(activity.start_rule, !activity.lane, true);
        });
    },

    _queryVariableValueTables: function(variableValues, elementMappings, activities) {
        variableValues.addExtraField('variable.name');
        variableValues.addExtraField('variable.element');
        var variableValuesQueryCondition, elementMappingsQueryCondition;
        activities
            .map(function(activity) {
                return activity.sys_id.value;
            })
            .forEach(function(sysId, index) {
                if (index === 0) {
                    variableValuesQueryCondition = variableValues.addQuery('document_key', sysId);
                    elementMappingsQueryCondition = elementMappings.addQuery('id', sysId);
                    return;
                }

                variableValuesQueryCondition.addOrCondition('document_key', sysId);
                elementMappingsQueryCondition.addOrCondition('id', sysId);
            });
        variableValues.query();
        elementMappings.query();
    },

    _addVariableValueEntry: function(variableMap, actSysId, tableName, fieldName, value, variableMapping) {
        if (!variableMap[actSysId]) {
            variableMap[actSysId] = {};
        }
        var type = this._getType(tableName, fieldName);
        if (!type) {
            return;
        }

        if (!variableMap[actSysId][type]) {
            variableMap[actSysId][type] = {};
        }

        var coercedFieldName = fieldName + ""; // force Java Object reference to become a static string value
        if (!variableMap[actSysId][type][coercedFieldName]) {
            variableMap[actSysId][type][coercedFieldName] = {
                variableName: coercedFieldName,
                variableValue: value + "",
                value: value + "",
                variableMapping: variableMapping + ""
            };
        } else if (variableMapping) {
            variableMap[actSysId][type][coercedFieldName].variableMapping = variableMapping + "";
        }
    },

    _getType: function(tableName) {
        var typeMap = {
            'sys_pd_activity_start_rule_var': 'startRule',
            'sys_hub_flow_input': 'inputs',
            'sys_hub_action_input': 'inputs',
            'sys_pd_activity_type_prop': 'type_vals'
        };
        if (!tableName.startsWith("var__m_")) {
            return null;
        }

        var modelName = tableName.substring("var__m_".length, tableName.lastIndexOf("_"));
        return typeMap[modelName];
    },

    _getVariables: function(gr, fieldName, config) {
        if (config && config.includeVarMeta !== undefined && !config.includeVarMeta && fieldName !== "outputs") {
            return {
                variables: []
            };
        }

        var variablesRecord = gr.getElement(fieldName).getVariablesRecord();
        var varMetadata = PDUtils.getGlideVariablesMetadata(fieldName, variablesRecord);
        return {
            variables: varMetadata
        };
    },

    _getActivityFromGR: function(gr, startDelay, config) {
        var startRuleActivities, startRuleBranches;
        if (!config || config.includeVarMeta === undefined || config.includeVarMeta) {
            var geStartRuleVarsActivities =
                gr.getElement(PDConstants.FIELDS.START_RULE_VAR_AFTER_ACTIVITIES);
            startRuleActivities =
                geStartRuleVarsActivities && geStartRuleVarsActivities.getValue();
            var geStartRuleVarsBranches =
                gr.getElement(PDConstants.FIELDS.START_RULE_VAR_BRANCHES);
            startRuleBranches =
                geStartRuleVarsBranches && geStartRuleVarsBranches.getValue();
            var startRuleVarValue = this._getStartRuleVarValue(startRuleActivities, startRuleBranches);
            startRuleActivities = startRuleVarValue.startRuleActivities;
            startRuleBranches = startRuleVarValue.startRuleBranches;
        }

        var FIELDS = PDConstants.FIELDS;
        if (!startDelay) {
            var startDelayGr = new GlideRecord(PDConstants.TABLES.PD_TIMER_ATTRIBUTES_TABLE);
            startDelayGr.addQuery('source', gr.getValue(FIELDS.SYS_ID));
            startDelayGr.query();
            if (startDelayGr.next()) {
                startDelay = PDUtils.getStartWithDelay(startDelayGr);
            }
        }

        var activityDefinitionObject;
        if (config && config.includeActivityDefinitions) {
            activityDefinitionObject = this.activityDefinitionRepo.getActivityDefinitionObject(gr[FIELDS.ACTIVITY_DEFINITION].getRefRecord());
        }

        var activityObject = {
            sys_id: PDUtils.getFieldReturnValue(gr, FIELDS.SYS_ID),
            label: PDUtils.getFieldReturnValue(gr, FIELDS.LABEL),
            coordinates: PDUtils.getFieldReturnValue(gr, FIELDS.COORDINATES),
            swim_lane: PDUtils.getFieldReturnValue(gr, FIELDS.SWIM_LANE),
            lane: PDUtils.getFieldReturnValue(gr, FIELDS.LANE),
            start_rule: {
                definition: gr.getValue(FIELDS.START_RULE),
                vars: {
                    activities: startRuleActivities || [],
                    branches: startRuleBranches || []
                },
                startRuleName: gr.getValue(PDConstants.FIELDS.START_RULE_NAME),
                startsAfterLanes: gr.getValue(PDConstants.FIELDS.STARTS_AFTER_LANES) && gr.getValue(PDConstants.FIELDS.STARTS_AFTER_LANES).split(','),
                startsAfterBranches: PDUtils.transformStartsAfterBranches(
                    gr.getValue(PDConstants.FIELDS.STARTS_AFTER_BRANCHES)
                ),
                startsAfterActivities: gr.getValue(PDConstants.FIELDS.STARTS_AFTER_ACTIVITIES) && gr.getValue(PDConstants.FIELDS.STARTS_AFTER_ACTIVITIES).split(','),
            },
            restart_rule: PDUtils.getFieldReturnValue(gr, FIELDS.RESTART_RULE),
            inputs: this._getVariables(gr, 'inputs', config),
            type_vals: this._getVariables(gr, 'type_vals', config),
            outputs: this._getVariables(gr, 'outputs', config),
            active: PDUtils.getFieldReturnValue(gr, FIELDS.ACTIVE),
            name: PDUtils.getFieldReturnValue(gr, FIELDS.NAME),
            description: PDUtils.getFieldReturnValue(gr, FIELDS.DESCRIPTION),
            activity_definition: PDUtils.getFieldReturnValue(gr, FIELDS.ACTIVITY_DEFINITION),
            activity_definition_obj: activityDefinitionObject,
            process_definition: PDUtils.getFieldReturnValue(gr, FIELDS.PROCESS_DEFINITION),
            sys_created_on: PDUtils.getFieldReturnValue(gr, FIELDS.SYS_CREATED_ON),
            sys_updated_on: PDUtils.getFieldReturnValue(gr, FIELDS.SYS_UPDATED_ON),
            condition_to_run: PDUtils.getFieldReturnValue(gr, FIELDS.CONDITION_TO_RUN),
            order: PDUtils.getFieldReturnValue(gr, FIELDS.ORDER),
            variant: PDUtils.getFieldReturnValue(gr, FIELDS.VARIANT),
            start_delay: {
                timerAttributes: startDelay || {}
            }
        };

        // Add ai_agent_fields only if the property is explicitly 'true'
        if (gs.getProperty(PDConstants.ENABLE_AGENTIC_PLAYBOOK) === 'true') {
            activityObject.ai_agent_fields = {
                ai_agent_objective: PDUtils.getFieldReturnValue(gr, FIELDS.AI_AGENT_OBJECTIVE),
                ai_agent_obj_additional_detail: PDUtils.getFieldReturnValue(gr, FIELDS.AI_AGENT_AUTONOMOUS_OBJECTIVE),
                enable_ai_agent: PDUtils.getFieldReturnValueInBoolean(gr, FIELDS.ENABLE_AI_AGENT),
                ai_agent_user: PDUtils.getFieldReturnValue(gr, FIELDS.AI_AGENT_USER),
                ai_agent_run_as: PDUtils.getFieldReturnValue(gr, FIELDS.AI_AGENT_RUN_AS),
                ai_agent_execution_mode: PDUtils.getFieldReturnValue(gr, FIELDS.AI_AGENT_ACTIVITY_AUTO_COMPLETE),
                conversational_agents: PDUtils.getFieldReturnValue(gr, FIELDS.CONVERSATIONAL_AGENTS),
                launch_agent_on_demand: gs.getProperty(PDConstants.LAUNCH_ON_DEMAND_FIELDS) === 'true'
                    ? PDUtils.getFieldReturnValueInBoolean(gr, FIELDS.LAUNCH_AGENT_ON_DEMAND)
                    : false
            };
        }

        return activityObject;
    },

    _getStartRuleVarValue: function(startRuleActivities, startRuleBranches) {
        if (startRuleActivities)
            startRuleActivities = startRuleActivities.split(',');
        if (startRuleBranches)
            startRuleBranches = startRuleBranches.split(',')
            .map(function(branch) {
                var splitBranch = branch.split('.');
                return {
                    activityId: splitBranch[0],
                    branchId: splitBranch[1]
                };
            });
        return {
            startRuleActivities: startRuleActivities,
            startRuleBranches: startRuleBranches
        };
    }
};

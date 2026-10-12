var PDProcessDefinitionRepository = Class.create();
PDProcessDefinitionRepository.prototype = {
    initialize: function() {
        this._processTypeUtil = new PDProcessTypeUtil();
    },
    type: 'PDProcessDefinitionRepository',
    getProcessDefinition: function(sysId) {
        return this._getProcessDefinition(sysId);
    },
    insertProcessDefinition: function(fields) {
        return this._mutateProcessDefinition(fields, false);
    },
    updateProcessDefinition: function(fields) {
        return this._mutateProcessDefinition(fields, true);
    },
    deleteProcessDefinition: function(sysId) {
        return this._deleteProcessDefinition(sysId);
    },
    getUnsupportedFeatures: function(processDefinitionId, targetProcessTypeId) {
        return this._getUnsupportedFeatures(processDefinitionId, targetProcessTypeId);
    },
    getParentPlaybooks: function(processDefinitionId) {
        return this._getParentPlaybooks(processDefinitionId);
    },
    _getProcessDefinition: function(sysId) {
        var processGr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);
        processGr.get(sysId);

        if (!processGr.isValidRecord()) {
            throw PADConstants.RecordNotFoundError;
        }

        if (!processGr.canRead()) {
            throw PADConstants.UnauthorizedError;
        }

        return this._getProcessFromGR(processGr);
    },
    _mutateProcessDefinition: function(fields, isUpdate) {
        fields = fields || {};
        var sysId = fields['sysId'];
        var sysScope = fields['sysScope'];
        var processGr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);

        if (isUpdate) {
            if (!sysId) {
                throw (gs.getMessage('Update process definition - Missing sysId'));
            }
            if (sysScope) {
                throw (gs.getMessage('Update process definition - Cannot override sysScope when updating a process definition'));
            }
            if (!processGr.get(sysId)) {
                throw (gs.getMessage('Update process definition - Unable to find process with id: {0}', sysId));
            }
            if (!processGr.canWrite()) {
                throw PADConstants.UnauthorizedError;
            }
        } else {
            if (!sysId) {
                // Generate the sys id if not provided
                sysId = gs.generateGUID();
            }
            // Set the sysId for create operation
            processGr.setNewGuidValue(sysId);
        }

        // Save updates to inputs and outputs until after process definition is inserted to ensure they have a parent
        var inputVars, outputVars, launcherInputVars;
        // Update the process GR
        for (var fieldName in fields) {
            var snakeCaseFieldName = PDUtils.camelcaseToSnakecase(fieldName);
            var fieldValue = fields[fieldName];
            if (snakeCaseFieldName === PDConstants.FIELDS.SYS_ID) {
                continue;
            } else if (snakeCaseFieldName === PDConstants.FIELDS.INPUTS) {
                inputVars = fieldValue;
            } else if (snakeCaseFieldName === PDConstants.FIELDS.OUTPUTS) {
                outputVars = fieldValue;
            } else if (snakeCaseFieldName === PDConstants.FIELDS.LAUNCHER_INPUTS) {
                launcherInputVars = fieldValue;
            } else if (snakeCaseFieldName === PDConstants.FIELDS.PERMISSION) {
                var parsedPermission;
                try {
                    parsedPermission = JSON.parse(fieldValue);
                } catch (e) {
                    parsedPermission = null;
                }
                if (parsedPermission === null) {
                    if (!isUpdate) {
                        var defaultPermission = PDUtils.getDefaultPermission();
                        PDUtils.setGlideRecordFieldValue(processGr, snakeCaseFieldName, defaultPermission);
                    }
                } else {
                    PDUtils.setGlideRecordFieldValue(processGr, snakeCaseFieldName, fieldValue);
                }
            } else {
                PDUtils.setGlideRecordFieldValue(processGr, snakeCaseFieldName, fieldValue);
            }
        }
        if (isUpdate) {
            if (!PDUtils.shouldRunProcessDefinitionBRs(fields)) {
                processGr.setWorkflow(false); // Prevents update from being included in update sets, will update async via scheduler
            }
            if (!processGr.update())
                throw gs.getMessage('Unable to update [process] {0}: {1}', [sysId, processGr.getLastErrorMessage()]);
        } else {
            if (!processGr.insert())
                throw gs.getMessage('Unable to insert [process] {0}: {1}', [sysId, processGr.getLastErrorMessage()]);
            var nowAssistAttachmentIdField = fields['nowAssistAttachmentId'];
            if (nowAssistAttachmentIdField) {
                var attachmentGr = new GlideRecord(PDConstants.TABLES.ATTACHMENT);
                attachmentGr.get(nowAssistAttachmentIdField);

                attachmentGr.setValue('table_sys_id', processGr.getUniqueValue());
                attachmentGr.update();

            }
            var padGCFCollector = new PADGCFCollector();
            padGCFCollector.recordProcessUsageEvent(padGCFCollector.processEvents.PROCESS_CREATED, 0);
        }

        if (fields.evaluateVariantChildrenAfter) {
            var padGCFCollector = new PADGCFCollector();
            padGCFCollector.recordProcessUsageEvent(padGCFCollector.processEvents.VARIANT_EVALUATION_POINT_SET, 0);
        }

        var pdVarDictUtils = new PDVarDictionaryUtils();
        if (!!inputVars) {
            pdVarDictUtils.updateVariables(PDConstants.TABLES.PD_PROCESS_INPUT, sysId, inputVars);
        };
        if (!!outputVars) {
            pdVarDictUtils.updateVariables(PDConstants.TABLES.PD_PROCESS_OUTPUT, sysId, outputVars);
        };
        if (!!launcherInputVars) {
            this._handleLauncherInputChanges(sysId, launcherInputVars);
        }

        // get fields from GR and return object
        return this._getProcessFromGR(processGr);
    },
    _getAbridgedProcessFromGR: function(processGr) {
        return {
            sys_id: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.SYS_ID),
            label: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.LABEL)
        };
    },
    _getProcessFromGR: function(processGr) {
        var attachmentObj = PDUtils.getAttachmentInfo(processGr);
        var processSysId = processGr.getValue(PDConstants.FIELDS.SYS_ID);
        var pdVarDictUtils = new PDVarDictionaryUtils();
        var processScope = PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.SYS_SCOPE);
        var variablesRecord = processGr.getElement(PDConstants.FIELDS.LAUNCHER_INPUTS).getVariablesRecord();
        var launcherInputsVarsMeta = PDUtils.getGlideVariablesMetadata(PDConstants.FIELDS.LAUNCHER_INPUTS, variablesRecord);

        return {
            sys_id: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.SYS_ID),
            active: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.ACTIVE),
            description: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.DESCRIPTION),
            summary: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.SUMMARY),
            label: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.LABEL),
            name: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.NAME),
            status: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.STATUS),
            process_type: this._getProcessType(processGr),
            allow_as_nested: PDUtils.getFieldReturnValueInBoolean(processGr, PDConstants.FIELDS.ALLOW_AS_NESTED),
            view_type: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.VIEW_TYPE),
            designer_state: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.DESIGNER_STATE),
            schema_version: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.SCHEMA_VERSION),
            sys_updated_on: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.SYS_UPDATED_ON),
            sys_created_on: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.SYS_CREATED_ON),
            sys_scope: processScope,
            snapshot: this._getSnapshot(processGr),
            restartable: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.RESTARTABLE),
            now_assist_prompt: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.NOW_ASSIST_PROMPT),
            now_assist_attachment_id: attachmentObj && attachmentObj.attachmentId ? attachmentObj.attachmentId : '',
            now_assist_attachment_name: attachmentObj && attachmentObj.attachmentName ? attachmentObj.attachmentName : '',
            now_assist_kb: PDUtils.getKbFieldReturnValue(processGr, PDConstants.FIELDS.NOW_ASSIST_KB),
            run_on_pad_engine: PDUtils.getFieldReturnValueInBoolean(processGr, PDConstants.FIELDS.RUN_ON_PAD_ENGINE),
            engine_major_version: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.ENGINE_MAJOR_VERSION),
            sync_state: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.SYNC_STATE),
            inputs: pdVarDictUtils.getVariables(PDConstants.TABLES.PD_PROCESS_INPUT, processSysId),
            outputs: pdVarDictUtils.getVariables(PDConstants.TABLES.PD_PROCESS_OUTPUT, processSysId),
            permission: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.PERMISSION),
            run_strategy: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.RUN_STRATEGY),
            run_strategy_on_process_definition: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.RUN_STRATEGY_ON_PROCESS_DEFINITION),
            evaluate_variant_children_after: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.EVALUATE_VARIANT_CHILDREN_AFTER),
            public_access: PDUtils.getFieldReturnValueInBoolean(processGr, PDConstants.FIELDS.PUBLIC_ACCESS),
            execution_type: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.EXECUTION_TYPE),
            launcher_title: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.LAUNCHER_TITLE),
            launcher_description: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.LAUNCHER_DESCRIPTION),
            launcher_show_record_form: PDUtils.getFieldReturnValueInBoolean(processGr, PDConstants.FIELDS.LAUNCHER_SHOW_RECORD_FORM),
            launcher_record_form_view: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.LAUNCHER_RECORD_FORM_VIEW),
            launcher_template_fields: PDUtils.getFieldReturnValue(processGr, PDConstants.FIELDS.LAUNCHER_TEMPLATE_FIELDS),
            launcher_inputs: launcherInputsVarsMeta
        };
    },

    _getProcessType: function(processGr) {
        // Get the process type sys_id
        var processTypeSysId = processGr.getValue(PDConstants.FIELDS.PROCESS_TYPE);
        
        // Leverage PDProcessTypeUtil for all feature fields with proper defaults
        var processTypeValues = this._processTypeUtil.getProcessTypeValues(
            processTypeSysId, 
            true // convertToBoolean
        );
        
        return processTypeValues;
    },
    _getSnapshot: function(processGr) {
        var snapshot = processGr.snapshot.getRefRecord();
        return {
            value: processGr.getValue(PDConstants.FIELDS.SNAPSHOT),
            created: snapshot.getValue(PDConstants.FIELDS.SYS_CREATED_ON)
        };
    },
    _deleteProcessDefinition: function(sysId) {
        var gr = new GlideRecordSecure(PADConstants.TABLES.PD_PROCESS_DEFINITION);
        gr.get(sysId);
        if (!gr.deleteRecord())
            throw (gs.getMessage('Unable to delete process with id: {0}', sysId));
        return {
            "sysId": sysId
        };
    },
    _getUnsupportedFeatures: function(processDefinitionId, targetProcessTypeId) {
        var processGr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);
        if (!processGr.get(processDefinitionId)) {
            throw (gs.getMessage('process definition with id {0} not found', processDefinitionId));
        }
        if (!processGr.canRead()) {
            throw PADConstants.UnauthorizedError;
        }
        // if no targetProcessTypeId is specified and the process has no process type return early
        var processDefProcessTypeId = processGr.getValue(PDConstants.FIELDS.PROCESS_TYPE);
        if (targetProcessTypeId === undefined && !processDefProcessTypeId) {
            return {
                unsupportedFeatures: [],
                processTypeId: processDefProcessTypeId
            };
        }
        // if targetProcessTypeId is specified, use it, else use the process type id on the process
        var processTypeId = targetProcessTypeId !== undefined ? targetProcessTypeId : processDefProcessTypeId;

        var processTypeUtil = new PDProcessTypeUtil();
        var settings = processTypeUtil.getProcessTypeValues(processTypeId, true);

        var unsupportedFeatures = [];

        var enableStages = settings[PDConstants.FIELDS.ENABLE_STAGES];
        if (!enableStages && this._hasMultipleStages(processDefinitionId)) {
            unsupportedFeatures.push(PDConstants.FEATURES.MULTIPLE_STAGES);
        }
        var enableOptionalActivities = settings[PDConstants.FIELDS.ENABLE_OPTIONAL_ACTIVITIES];
        if (!enableOptionalActivities && this._hasOptionalActivities(processDefinitionId)) {
            unsupportedFeatures.push(PDConstants.FEATURES.OPTIONAL_ACTIVITIES);
        }
        var enableDecisions = settings[PDConstants.FIELDS.ENABLE_DECISIONS];
        if (!enableDecisions && this._hasDecisionActivities(processDefinitionId)) {
            unsupportedFeatures.push(PDConstants.FEATURES.DECISIONS);
        }
        var enableVariants = settings[PDConstants.FIELDS.ENABLE_VARIANTS];
        if (!enableVariants && this._hasVariants(processDefinitionId)) {
            unsupportedFeatures.push(PDConstants.FEATURES.VARIANTS);
        }
        var enableAllActivities = settings[PDConstants.FIELDS.ENABLE_ALL_ACTIVITIES];
        if (!enableAllActivities && this._hasNonProcessTypeActivities(processDefinitionId, processTypeId)) {
            unsupportedFeatures.push(PDConstants.FEATURES.ALL_ACTIVITIES);
        }
        var enablePublicAccess = settings[PDConstants.FIELDS.ENABLE_PUBLIC_ACCESS];
        var playbookHasPublicAccess = processGr.getValue(PDConstants.FIELDS.PUBLIC_ACCESS) === 'true';
        if (!enablePublicAccess && playbookHasPublicAccess) {
            unsupportedFeatures.push(PDConstants.FEATURES.PUBLIC_ACCESS);
        }

        return {
            unsupportedFeatures: unsupportedFeatures,
            processTypeId: processDefProcessTypeId
        };
    },
    _hasMultipleStages: function(processDefinitionId) {
        // check the number of lanes
        var lanesAggGr = new GlideAggregate(PDConstants.TABLES.PD_LANE);
        lanesAggGr.addQuery(PDConstants.FIELDS.PROCESS_DEFINITION, processDefinitionId);
        lanesAggGr.addAggregate('COUNT');
        lanesAggGr.query();
        var lanesCount = 0;
        if (lanesAggGr.next())
            lanesCount = lanesAggGr.getAggregate('COUNT');
        return lanesCount > 1;
    },
    _hasOptionalActivities: function(processDefinitionId) {
        // check the number of optional activities
        var activitiesAggGr = new GlideAggregate(PDConstants.TABLES.PD_ACTIVITY);
        activitiesAggGr.addQuery(PDConstants.FIELDS.PROCESS_DEFINITION, processDefinitionId);
        activitiesAggGr.addQuery(PDConstants.FIELDS.START_RULE, PDConstants.START_RULES.MANUAL);
        activitiesAggGr.addAggregate('COUNT');
        activitiesAggGr.query();
        var activitiesCount = 0;
        if (activitiesAggGr.next())
            activitiesCount = activitiesAggGr.getAggregate('COUNT');
        return activitiesCount > 0;
    },
    _hasDecisionActivities: function(processDefinitionId) {
        // check the number of optional activities
        var activitiesAggGr = new GlideAggregate(PDConstants.TABLES.PD_ACTIVITY);
        activitiesAggGr.addQuery(PDConstants.FIELDS.PROCESS_DEFINITION, processDefinitionId);
        activitiesAggGr.addQuery(PDConstants.FIELDS.ACTIVITY_DEFINITION, PDConstants.ACTIVITY_DEFINITION_IDS.DECISION);
        activitiesAggGr.addAggregate('COUNT');
        activitiesAggGr.query();
        var activitiesCount = 0;
        if (activitiesAggGr.next())
            activitiesCount = activitiesAggGr.getAggregate('COUNT');
        return activitiesCount > 0;
    },
    _hasVariants: function(processDefinitionId) {
        // check the number of variants
        var variantsAggGr = new GlideAggregate(PDConstants.TABLES.PD_PROCESS_VARIANT);
        variantsAggGr.addQuery(PDConstants.FIELDS.PROCESS_DEFINITION, processDefinitionId);
        variantsAggGr.addAggregate('COUNT');
        variantsAggGr.query();
        var variantsCount = 0;
        if (variantsAggGr.next())
            variantsCount = variantsAggGr.getAggregate('COUNT');
        return variantsCount > 0;
    },
    _hasNonProcessTypeActivities: function(processDefinitionId, processTypeId) {
        var playbookTypeActivitiesGr = PDUtils.getPlaybookTypeActivities(processTypeId);
        var allowedActivities = [];

        while (playbookTypeActivitiesGr.next()) {
            allowedActivities.push(playbookTypeActivitiesGr.getValue(PDConstants.FIELDS.ACTIVITY_DEFINITION));
        }

        var activitiesAggGr = new GlideAggregate(PDConstants.TABLES.PD_ACTIVITY);
        activitiesAggGr.addQuery(PDConstants.FIELDS.PROCESS_DEFINITION, processDefinitionId);
        activitiesAggGr.addQuery(PDConstants.FIELDS.ACTIVITY_DEFINITION, "NOT IN", allowedActivities);
        activitiesAggGr.addAggregate('COUNT');
        activitiesAggGr.query();

        var activitiesCount = 0;
        while (activitiesAggGr.next()) {
            activitiesCount = activitiesAggGr.getAggregate('COUNT');
        }

        return activitiesCount > 0;
    },
    _parseResult: function(response) {
        var values = response.responseXML.documentElement.getAttribute("answer");
        return JSON.parse(values);
    },
    _getParentPlaybooks: function(processSysId) {
        var pdActivityGr = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY);
        pdActivityGr.addQuery(PDConstants.FIELDS.ACTIVITY_DEFINITION, PDConstants.ACTIVITY_DEFINITION_IDS.LAUNCH_NESTED_PLAYBOOK);
        pdActivityGr.query();
        var parentProcesses = [];
        var processGr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);

        while (pdActivityGr.next()) {
            if (pdActivityGr.inputs.playbook_definition == processSysId) {
                processGr.get(pdActivityGr.getValue(PDConstants.FIELDS.PROCESS_DEFINITION));
                parentProcesses.push(this._getAbridgedProcessFromGR(processGr));
                // For now we just want to check if any process uses this process as a child...
                // ...because this query is slow
                // In the future we will want to keep track of all of them
                return parentProcesses;
            }
        }

        return {
            parentProcesses: parentProcesses
        };
    },
    _handleLauncherInputChanges: function(processDefinitionId, field) {
        field = field || {};
        var processDefinitionGR = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);
        if (!processDefinitionGR.get(processDefinitionId)) {
            throw (gs.getMessage('Failed to retrieve process definition with sysId: {0}', processDefinitionId));
        }
        var newInputs = field.variables || [];
        try {
            if (newInputs.length) {
                newInputs.forEach(function(variable) {
                    variable = variable || {};
                    if (variable.variableName) {
                        var glideVarElement = variable.glideVarElement || PDConstants.FIELDS.LAUNCHER_INPUTS;
                        var variableElement = processDefinitionGR.getElement(glideVarElement + '.' + variable.variableName);
                        variableElement.setValue(variable.value || variable.variableValue || '');
                        // to support pill display value on initial load, we store displayValue in here. This will work for nonpill as well
                        if (variable.displayValue) variableElement.setDisplayValue(variable.displayValue);
                    }
                });
                processDefinitionGR.update();
            }
        } catch (err) {
            throw gs.getMessage(
                'Unable to update inputs for process definition with id: {0}', processDefinitionId);
        }
        return processDefinitionGR;
    }
};

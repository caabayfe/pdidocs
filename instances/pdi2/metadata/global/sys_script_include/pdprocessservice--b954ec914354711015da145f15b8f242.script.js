var PDProcessService = Class.create();
PDProcessService.prototype = {
    initialize: function() {
        this.actService;
        this.laneService;
        this.processDefinitionService;
        this.appObjService;
        this.swimService;
        this.processContextService;
        this.variantService;
        this.overrideService;
        this.panelOverrideService;
        this.triggerInstanceService;
        this.accessControlMetadataService;
    },
    type: 'PDProcessService',
    // service getters
    _getProcessDefinitionService: function() {
        if (!this.processDefinitionService)
            this.processDefinitionService = new PDProcessDefinitionService();
        return this.processDefinitionService;
    },
    _getLaneService: function() {
        if (!this.laneService)
            this.laneService = new PDLaneService();
        return this.laneService;
    },
    _getActivityService: function() {
        if (!this.actService)
            this.actService = new PDActivityService();
        return this.actService;
    },
    _getSwimService: function() {
        if (!swimService)
            this.swimService = new PDSwimLaneService();
        return swimService;
    },
    _getActAppObjService: function() {
        if (!appObjService)
            this.appObjService = new PDActivityAppObjectService();
        return appObjService;
    },
    _getProcessContextService: function() {
        if (!this.processContextService)
            this.processContextService = new PDProcessContextService();
        return this.processContextService;
    },
    _getVariantService: function() {
        if (!this.variantService)
            this.variantService = new PDVariantService();
        return this.variantService;
    },
    _getOverrideService: function() {
        if (!this.overrideService)
            this.overrideService = new PDOverrideService();
        return this.overrideService;
    },
    _getPanelOverrideService: function() {
        if (!this.panelOverrideService)
            this.panelOverrideService = new PDPanelOverrideService();
        return this.panelOverrideService;
    },
    _getTriggerInstanceService: function() {
        if (!this.triggerInstanceService)
            this.triggerInstanceService = new PDTriggerInstanceService();
        return this.triggerInstanceService;
    },
    _getAccessControlMetadataService: function() {
        if (!this.accessControlMetadataService)
            this.accessControlMetadataService = new PDAccessControlMetadataService();
        return this.accessControlMetadataService;
    },

    /************************************************
     ***** "Public" methods below               *****
     ***** ACL checks should be done by callers *****
     ************************************************/

    getProcess: function(data) {
        var processResult = this._getProcessDefinitionService().getProcessDefinition(data.processDefinitionId);
        var triggersResult = this._getTriggerInstanceService().getTriggerInstances(data.processDefinitionId);
        var lanesResult = this._getLaneService().getLanes(data.processDefinitionId);
        var activitiesResult = this._getActivityService().getActivities(data.processDefinitionId, data.config);
        var variantsResult = this._getVariantService().getVariants(data.processDefinitionId);
        var overridesResult = this._getOverrideService().getOverrides(data.processDefinitionId);

        this._getAccessControlMetadataService().updateAccessControlMetadata(processResult, triggersResult);

        var response = {
            process: processResult,
            triggers: triggersResult,
            lanes: lanesResult,
            activities: activitiesResult,
            variants: variantsResult,
            overrides: overridesResult
        };

        if (!PDUtils.isEmptyObject(processResult) && PDUtils.notEmptyArray(triggersResult)) {
            response.process.triggerRecordData = triggersResult[0];
        }

        if (data.config && data.config.includePanelOverrides && processResult.process_type) {
            var processTypeId = processResult.process_type.sys_id.value;
            var panelOverridesResult = this._getPanelOverrideService().getPanelOverrides(processTypeId);
            response.panelOverrides = panelOverridesResult;
        }

        return response;
    },

    /**
     * See full object schema in pad graphql schema for createProcessData mutation
     * @param data - Object: {process, triggers, lanes, activities}
     */
    createProcess: function(data) {
        const pdScopeSwitcher = new PDScopeSwitcher();
        const varUtils = new PDVarDictionaryUtils();
        const triggerRecordData = (data.process || {}).triggerRecordData;
        let processScope = data.process.sysScope;

        if (!processScope)
            throw (gs.getMessage('Missing required field: sysScope'));

        // Trigger related changes are here to support Creator Studio
        if (!PDUtils.isEmptyObject(triggerRecordData))
            data.triggers = (data.triggers || []).concat(triggerRecordData);
        // Supporting single trigger for now
        const trigger = data.triggers?.[0];
        const triggerTable = trigger?.inputs?.variables?.find(input => input.variableName === PDConstants.FIELDS.TABLE)?.variableValue;
        let parentRecordInput = trigger?.inputs?.variables?.find(input => (input.name === PDConstants.FIELDS.PARENT_RECORD || input.variableName === PDConstants.FIELDS.PARENT_RECORD)) || {};
        // Create parent_record input referencing trigger table, if provided
        if (triggerTable) {
            parentRecordInput = {
                ...PDConstants.PARENT_RECORD_INPUT,
                reference: triggerTable,
                ...parentRecordInput
            };
            // Update process inputs accordingly. When creating Creator studio, process inputs are not defined.
            data.process.inputs = {
                variables: [parentRecordInput]
            };

            // Add to trigger inputs with default pill value
            trigger.inputs.variables.push({
                ...parentRecordInput,
                displayValue: PDConstants.DEFAULT_TRIGGER_RECORD_PILL,
                variableMapping: PDConstants.DEFAULT_TRIGGER_RECORD_PILL
            });
        } else {
            // If no triggers provided, as long as this isn't explicitly set to record driven, set sys_playbook_execution as parent_record input
            if (data.process.executionType !== PDConstants.EXECUTION_TYPES.RECORD_DRIVEN) {
                const parentRecordInput = Object.assign({}, PDConstants.PARENT_RECORD_INPUT);
                parentRecordInput.reference = PDConstants.TABLES.SYS_PLAYBOOK_EXECUTION;
                data.process.inputs = {
                    variables: [parentRecordInput]
                };
            }
        }

        data.process.runStrategy = trigger?.[PDConstants.FIELDS.RUN_STRATEGY_ON_PROCESS_DEFINITION] || trigger?.runStrategy || trigger?.[PDConstants.FIELDS.RUN_STRATEGY] || PDConstants.DEFAULT_RUN_STRATEGY;

        try {
            pdScopeSwitcher.switchScope(processScope);

            var processResult = this._getProcessDefinitionService().insertProcessDefinition(data.process);
            const processId = processResult.sys_id.value;

            var triggersResult = this._getTriggerInstanceService().insertTriggerInstances(processId, data.triggers);

            this._getAccessControlMetadataService().updateAccessControlMetadata(processResult, triggersResult);

            if (PDUtils.notEmptyArray(triggersResult)) {
                processResult.triggerRecordData = triggersResult[0];
            }
            // Check if lane data is supplied. If not and the process has been assigned
            // a process type, check if stages are enabled. If a process is intended to
            // be a single lane process and no lane is supplied create a lane.
            var lanes = data.lanes || [];
            if ((!lanes || lanes.length == 0) && data.process.processType) {
                var processTypeRecord = new GlideRecord(PDConstants.TABLES.PD_PROCESS_TYPE);
                if (processTypeRecord.get(data.process.processType)) {
                    if (!processTypeRecord[PDConstants.FIELDS.ENABLE_STAGES]) {
                        lanes.push({
                            processDefinition: processId,
                            startRule: {
                                definition: PDConstants.START_RULES.LANE_IMMEDIATELY
                            },
                            order: 1,
                            label: "New Stage"
                        });
                    }
                }
            }
            var lanesResult = this._getLaneService().insertLanes(lanes);
            var activitiesResult = this._getActivityService().insertActivities(data.activities, data.config);
            // Activity and lane repos skip Business Rules on the activity and
            // lane tables to auto bump the parent process record timestamp whenever
            // activities and lanes are created/updated/deleted. Because here the
            // process is created first and lanes and activities are added later,
            // we need to manually bump process timestamp in order to unload
            // the process update set.
            if ((lanesResult || []).length || (activitiesResult || []).length || (triggersResult || []).length) {
                PDUtils.setParentProcessUpdatedOnScheduled(processId);
            }
            var response = {
                process: processResult,
                triggers: triggersResult,
                lanes: lanesResult,
                activities: activitiesResult
            };

            if (data.additionalContextInfo) {
                var generationRequestId = data.additionalContextInfo.generationRequestId;
                if (generationRequestId && PDUtils.isNowAssistForPlaybookPluginActive()) {
                    var genContextUtil = new PDGenerationContextUtil();
                    var genContextGr = genContextUtil.getLatestGenerationContextByRequestId(generationRequestId);
                    if (genContextGr.next()) {
                        var contextId = genContextGr.getUniqueValue();
                        genContextUtil.updateGenerationContext(contextId, function() {
                            return {
                                [PDConstants.FIELDS.GENERATION_CONTEXT_STATE]: genContextUtil.GENERATION_STATE.PERSISTED,
                                [PDConstants.FIELDS.GENERATION_CONTEXT_PROCESS_DEFINITION]: processId
                            };
                        });
                    }
                }
            }

            if (data.config && data.config.includePanelOverrides && processResult.process_type) {
                var processTypeId = processResult.process_type.sys_id.value;
                var panelOverridesResult = this._getPanelOverrideService().getPanelOverrides(processTypeId);
                response.panelOverrides = panelOverridesResult;
            }

            return response;
        } finally {
            pdScopeSwitcher.resetScope();
        }
    },
    /**
     * See full object schema in pad graphql schema for updateProcessData mutation
     * @param data - Object: {process, triggers, lanes, activities, swimlanes, activityAppObjects}
     */
    updateProcess: function(data) {
        var processArgs = data.process || {};
        var processId = processArgs.sysId;
        var gr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);
        if (!gr.get(processId))
            throw (gs.getMessage('Unable to find process with id: {0}', processId));
        var processScope = gr.getValue(PDConstants.FIELDS.SYS_SCOPE);
        var pdScopeSwitcher = new PDScopeSwitcher();
        try {
            pdScopeSwitcher.switchScope(processScope);
            var triggerArgs = data.triggers || {};
            var actArgs = data.activities || {};
            var swimArgs = data.swimlanes || {};
            var actAppObjArgs = data.activityAppObjects || {};
            var processSchemaVersion = processArgs.schemaVersion;
            var laneArgs = data.lanes || {};
            var variantArgs = data.variants || {};
            var overrideArgs = data.overrides || {};
            var config = data.config || {};

            var triggersResult = [];
            var actResult = [];
            var swimResult = [];
            var laneResult = [];
            var variantResult = [];
            var overrideResult = [];

            var processResult;
            var notEmptyArray = PDUtils.notEmptyArray;
            // Order of operations matters. Each service should throw if its operation
            // fails, errors are caught here and subsequent operations are not executed

            var processExists = !PDUtils.isEmptyObject(processArgs, ['sysId']);
            // For backwards compatibility, if deprecated triggerRecordData field present on the
            // process arguments, update it using the trigger instance service
            if (processExists && !PDUtils.isEmptyObject(processArgs.triggerRecordData)) {
                triggerArgs.update = (triggerArgs.update || []).concat(processArgs.triggerRecordData);
            }

            //Overrides
            if (notEmptyArray(overrideArgs.insert))
                overrideResult = overrideResult.concat(
                    this._getOverrideService().insertOverrides(overrideArgs.insert));
            if (notEmptyArray(overrideArgs.update))
                overrideResult = overrideResult.concat(
                    this._getOverrideService().updateOverrides(overrideArgs.update));
            if (notEmptyArray(overrideArgs.remove))
                this._getOverrideService().deleteOverrides(overrideArgs.remove);

            // Variants
            if (notEmptyArray(variantArgs.insert))
                variantResult = variantResult.concat(
                    this._getVariantService().insertVariants(variantArgs.insert));
            if (notEmptyArray(variantArgs.update))
                variantResult = variantResult.concat(
                    this._getVariantService().updateVariants(variantArgs.update));
            if (notEmptyArray(variantArgs.remove))
                this._getVariantService().deleteVariants(variantArgs.remove);

            // Insert swimlanes/lanes needs to go before activity adding
            if (notEmptyArray(swimArgs.insert))
                swimResult = swimResult.concat(
                    this._getSwimService().insertSwimLanes(swimArgs.insert));
            if (notEmptyArray(laneArgs.insert))
                laneResult = laneResult.concat(
                    this._getLaneService().insertLanes(laneArgs.insert));
            // Activities 1
            if (notEmptyArray(actArgs.insert))
                actResult = actResult.concat(
                    this._getActivityService().insertActivities(actArgs.insert, config));
            // Activity App Objects
            if (notEmptyArray(actAppObjArgs.insert))
                this._getActAppObjService().insertActivityAppObjects(actAppObjArgs.insert);
            if (notEmptyArray(actAppObjArgs.remove))
                this._getActAppObjService().deleteActivityAppObjects(actAppObjArgs.remove);
            // Activities 2
            if (notEmptyArray(actArgs.update))
                actResult = actResult.concat(
                    this._getActivityService().updateActivities(actArgs.update, processSchemaVersion, config));
            if (notEmptyArray(actArgs.remove))
                this._getActivityService().deleteActivities(actArgs.remove);
            // Swim Lanes
            if (notEmptyArray(swimArgs.update))
                swimResult = swimResult.concat(
                    this._getSwimService().updateSwimLanes(swimArgs.update));
            if (notEmptyArray(swimArgs.remove))
                this._getSwimService().deleteSwimLanes(swimArgs.remove);
            // Lanes
            if (notEmptyArray(laneArgs.update))
                laneResult = laneResult.concat(
                    this._getLaneService().updateLanes(laneArgs.update, processSchemaVersion));
            if (notEmptyArray(laneArgs.remove))
                this._getLaneService().deleteLanes(laneArgs.remove);
            // Process details
            if (processExists) {
                processResult = this._getProcessDefinitionService().updateProcessDefinition(processArgs);
                this._getAccessControlMetadataService().updateAccessControlMetadata(processResult, triggersResult);
            }
            // Triggers
            if (notEmptyArray(triggerArgs.insert))
                triggersResult = triggersResult.concat(
                    this._getTriggerInstanceService().insertTriggerInstances(processId, triggerArgs.insert));
            if (notEmptyArray(triggerArgs.update))
                triggersResult = triggersResult.concat(
                    this._getTriggerInstanceService().updateTriggerInstances(processId, triggerArgs.update));
            if (notEmptyArray(triggerArgs.remove))
                this._getTriggerInstanceService().deleteTriggerInstances(triggerArgs.remove);
            // Transaction doesn't touch parent process record so we need to here
            // in order to unload process Update XML
            // Note: Updating the parent record (process definition) no longer triggers update set
            // and will also unload through scheduled job
            if (!PDUtils.shouldRunProcessDefinitionBRs(processArgs))
                PDUtils.setParentProcessUpdatedOnScheduled(processId);

            var responseData = {};
            if (notEmptyArray(actResult))
                responseData.activities = actResult;
            if (notEmptyArray(swimResult))
                responseData.swimlanes = swimResult;
            if (processResult)
                responseData.process = processResult;
            if (notEmptyArray(triggersResult)) {
                responseData.triggers = triggersResult;
                // Update process.triggerRecordData for backwards compatibility
                // If using triggerRecordData, assume not using multiple triggers so
                // grabbing the first result is sufficient.
                if (!responseData.process)
                    responseData.process = {};
                responseData.process.triggerRecordData = triggersResult[0];
            }
            if (notEmptyArray(laneResult))
                responseData.lanes = laneResult;
            if (notEmptyArray(variantResult))
                responseData.variants = variantResult;
            if (notEmptyArray(overrideResult))
                responseData.overrides = overrideResult;

            return responseData;
        } finally {
            pdScopeSwitcher.resetScope();
        }
    },
    deleteProcess: function(data) {
        var pdScopeSwitcher = new PDScopeSwitcher();
        try {
            pdScopeSwitcher.switchScope(data.scope);
            return this._getProcessDefinitionService().deleteProcessDefinition(data.sysId);
        } finally {
            pdScopeSwitcher.resetScope();
        }
    },
    archiveProcessContexts: function(contextIds) {
        return this._getProcessContextService().archiveProcessContexts(contextIds);
    },
    contextIsEligibleForArchive: function(contextRecord) {
        return this._getProcessContextService().contextIsEligibleForArchive(contextRecord);
    },
    getUnsupportedFeatures: function(data) {
        return this._getProcessDefinitionService().getUnsupportedFeatures(data.processDefinitionId, data.targetProcessTypeId);
    },
};

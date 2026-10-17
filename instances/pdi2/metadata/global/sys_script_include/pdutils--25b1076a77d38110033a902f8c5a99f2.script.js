var PDUtils = Class.create();
PDUtils.prototype = {
    initialize: function() {},

    type: 'PDUtils'
};
PDUtils.camelcaseToSnakecase = function(value) {
    if (!value)
        return;

    return value.split(/(?=[A-Z])/).join('_').toLowerCase();
};

PDUtils.convertTopLevelObjectKeysToSnakeCase = function(obj) {
    var result = {};
    for (var key in obj) {
        var snakeCaseKey = PDUtils.camelcaseToSnakecase(key);
        result[snakeCaseKey] = obj[key];
    }
    return result;
};

PDUtils.convertObjectStringValuesToObjectValues = function(obj) {
    var result = {};
    for (var key in obj) {
        if (typeof obj[key] === 'string') {
            result[key] = {
                value: obj[key]
            };
        } else {
            result[key] = obj[key];
        }
    }
    return result;
};

PDUtils.getAttachmentInfo = function(processGr) {
    var attachmentGr = new GlideRecord(PDConstants.TABLES.ATTACHMENT);
    attachmentGr.addQuery(PDConstants.FIELDS.TABLE_SYS_ID, processGr.getUniqueValue());
    attachmentGr.orderBy(PDConstants.FIELDS.SYS_CREATED_ON);
    attachmentGr.setLimit(1);
    attachmentGr.query();
    if (attachmentGr.next()) {
        return {
            'attachmentId': attachmentGr.getUniqueValue(),
            'attachmentName': attachmentGr.getValue(PDConstants.FIELDS.FILE_NAME)
        };
    }

    return {};
};

PDUtils.getOriginalAttachmentObjectFromSysId = function(scaledAttachmentId) {
    var attachmentInfo = {};
    var scaledAttachmentGr = new GlideRecord(PDConstants.TABLES.ATTACHMENT);
    scaledAttachmentGr.get(scaledAttachmentId);
    scaledAttachmentGr.query();
    if (scaledAttachmentGr.next()) {
        var originalAttachmentGr = new GlideRecord(PDConstants.TABLES.ATTACHMENT);
        var originalAttachmentId = scaledAttachmentGr.getValue(PDConstants.FIELDS.TABLE_SYS_ID);
        originalAttachmentGr.get(originalAttachmentId);
        originalAttachmentGr.query();
        if (originalAttachmentGr.next()) {
            attachmentInfo = {
                'attachmentId': originalAttachmentGr.getUniqueValue(),
                'attachmentName': originalAttachmentGr.getValue(PDConstants.FIELDS.FILE_NAME)
            };
        } else {
            attachmentInfo = {
                'attachmentId': scaledAttachmentGr.getUniqueValue(),
                'attachmentName': scaledAttachmentGr.getValue(PDConstants.FIELDS.FILE_NAME)
            };
        }
    }
    return attachmentInfo;
};

PDUtils.getKbFieldReturnValue = function(gr, fieldName, defaultValue) {
    var fieldReturnValue = PDUtils.getFieldReturnValue(gr, fieldName, defaultValue);
    var kbGr = new GlideRecord(PDConstants.TABLES.KB_KNOWLEDGE);
    kbGr.get(fieldReturnValue.value);
    if (kbGr.isValidRecord()) {
        fieldReturnValue.short_description = kbGr.getDisplayValue(PDConstants.FIELDS.SHORT_DESCRIPTION);
    }
    return fieldReturnValue;
};

PDUtils.getFieldReturnValue = function(gr, fieldName, defaultValue) {
    var value = gr.getValue(fieldName) || defaultValue || null;
    return {
        value: value,
        display_value: gr.getDisplayValue(fieldName)
    };
};

PDUtils.getFieldReturnValueInBoolean = function(gr, fieldName, defaultValue) {
    var value = gr.getValue(fieldName);
    value = value === null ?
        ((defaultValue === null || defaultValue === undefined) ? null : defaultValue) :
        JSUtil.getBooleanValue(gr, fieldName);
    return {
        value: value,
        display_value: gr.getDisplayValue(fieldName)
    };
};

// @param gr - GlideRecord
// @param fields - array of field names OR
//                 object = { name:String, hasDisplayValue:boolean }
PDUtils.grToObject = function(gr, fields) {
    return fields.reduce(function(result, field) {
        if (typeof field === 'object' && field.name && field.hasDisplayValue) {
            result[field.name] = {
                value: gr.getValue(field.name),
                display_value: gr.getDisplayValue(field.name)
            };
        } else if (typeof field === 'string') {
            result[field] = gr.getValue(field);
        }
        return result;
    }, {});
};

PDUtils.makeActivityStartRuleRefQualQuery = function(schema_version) {
    var query = 'nameIN';
    if (schema_version < 2)
        query = query + PADConstants.kanbanStartRuleNames.join(',');
    else
        query = query + PADConstants.v2ActivityStartRuleNames.join(',');

    return query;
};

PDUtils.makeLaneStartRuleRefQualQuery = function(schema_version) {
    var query = 'nameIN';
    if (schema_version < 2)
        query = query + PADConstants.v1LaneStartRuleNames.join(',');
    else
        query = query + PADConstants.v2LaneStartRuleNames.join(',');

    return query;
};

PDUtils.notEmptyArray = function(arr) {
    return Array.isArray(arr) && arr.length > 0;
};

PDUtils.processAfterSpecificStartRuleVar = function(opts) {
    opts = opts || {};
    var current = opts.current;
    var table = opts.table;
    var varField = opts.varField;
    var parentField = opts.parentField;
    var results = {
        hasInvalidVar: false
    };

    var ge = current.getElement(varField);
    if (!ge)
        return results;
    var items = ge.getValue().split(',');
    if (!items.length)
        return results;
    // Ensure start rule var doesn't have duplicates
    var dedupedArray = Object.keys(
        items.reduce(function(map, id) {
            map[id] = true;
            return map;
        }, {})
    );
    // Also ensures var doesn't reference self
    var filteredArray = items.filter(function(id) {
        return id !== current.getUniqueValue();
    });
    if (
        dedupedArray.length !== items.length ||
        filteredArray.length !== items.length
    ) {
        results.hasInvalidVar = true;
        return results;
    }
    var itemsGr = new GlideRecord(table);
    // Also ensures var has actual records
    itemsGr.addQuery(PDConstants.FIELDS.SYS_ID, 'IN', items.join(','));
    // Also ensures var has records with same parent record
    itemsGr.addQuery(parentField, current.getValue(parentField));
    itemsGr.query();
    if (itemsGr.getRowCount() !== items.length) {
        results.hasInvalidVar = true;
        return results;
    }
    results.itemsGr = itemsGr;
    return results;
};

PDUtils.newGlideRecordWithSkipProcessUpdate = function(tablename) {
    var gr = new GlideRecord(tablename);
    gr.skipProcessUpdate = true;
    return gr;
};

/**
 * processId: sys id of process being updated
 * updatedOn: datetime of update
 * updateSetId: id of update set to put update in
 */
PDUtils.setParentProcessUpdatedOn = function(processId, updatedOn, updateSetId) {
    PDUtils.setParentProcessUpdatedOn(processId, updatedOn, updateSetId, false);
};

/**
 * processId: sys id of process being updated
 * updatedOn: datetime of update
 * updateSetId: id of update set to put update in
 */
PDUtils.setParentProcessUpdatedOn = function(processId, updatedOn, updateSetId, hasSetUpdatedOn) {
    var pdScopeSwitcher = new PDScopeSwitcher();

    try {
        var gr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);
        if (!gr.get(processId))
            return;

        var scopeId = gr.getValue(PDConstants.FIELDS.SYS_SCOPE);
        pdScopeSwitcher.switchScope(scopeId, updateSetId);

        var gdtNextUpdatedOn = new GlideDateTime();
        if (updatedOn)
            // Param is assumed to be UTC time
            gdtNextUpdatedOn.setValue(updatedOn);
        var gdtProcessUpdatedOn = new GlideDateTime(
            // gr.getValue returns UTC time
            gr.getValue(PDConstants.FIELDS.SYS_UPDATED_ON));
        // Check GlideDateTime compareTo docs. If gdtNextUpdatedOn is
        // greater than gdtProcessUpdatedOn this would yield 1
        // Activate will have already updated field updatedOn and therefore will skip check
        if (gdtNextUpdatedOn.compareTo(gdtProcessUpdatedOn) < 1 && !hasSetUpdatedOn)
            return;
        gr.autoSysFields(false);
        // Do not use gr.sys_updated_on = newTime, newTime will
        // be assumed to be local time instead of UTC
        gr.setValue(PDConstants.FIELDS.SYS_UPDATED_ON, gdtNextUpdatedOn.getValue());
        gr.setValue(PDConstants.FIELDS.SYNC_STATE, PDConstants.STATE_VALUES.IN_PROGRESS);
        gr.update();
    } finally {
        pdScopeSwitcher.resetScope();
    }
};

PDUtils.setProcessSyncStateScheduled = function(processId) {
    // set sync_state to scheduled or in_progress_and_scheduled when state is in_progress
    var gr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);
    gr.get(processId);
    if (gr.getValue(PDConstants.FIELDS.SYNC_STATE) == PDConstants.STATE_VALUES.IN_PROGRESS) {
        gr.setValue(PDConstants.FIELDS.SYNC_STATE, PDConstants.STATE_VALUES.IN_PROGRESS_AND_SCHEDULED);
    } else {
        gr.setValue(PDConstants.FIELDS.SYNC_STATE, PDConstants.STATE_VALUES.SCHEDULED);
    }
    gr.setSystem(true); // to ensue the update doesn't change sys_update_on
    gr.setWorkflow(false);
    gr.update();
};

PDUtils.setParentProcessUpdatedOnScheduled = function(processId, updatedOn) {
    if (!processId)
        return;

    // we need to get the update set id here otherwise it'll just be the default when the script below is run
    GlideRunScriptJob.scheduleScript(
        'PDUtils.setParentProcessUpdatedOn("' + processId + '", "' + (updatedOn || '') + '", "' + (new GlideUpdateSet().get()) + '");'
    );

    PDUtils.setProcessSyncStateScheduled(processId);
};

PDUtils.shallowClone = function(obj) {
    obj = obj || {};
    var shallowClonedObj = {};
    for (var key in obj)
        shallowClonedObj[key] = obj[key];
    return shallowClonedObj;
};

PDUtils.isEmptyObject = function(obj, excludeKeys) {
    var shallowClonedObj = PDUtils.shallowClone(obj);
    (excludeKeys || []).forEach(function(key) {
        delete shallowClonedObj[key];
    });
    return Object.keys(shallowClonedObj).length === 0;
};

PDUtils.removeInvalidStartRuleVars = function(obj) {
    var sysId = obj.sysId;
    var itemType = obj.itemType;
    var laneId = obj.laneId || '';
    var processDefinition = obj.processDefinition;
    var tableName = itemType === PDConstants.FIELDS.ACTIVITY ? PDConstants.TABLES.PD_ACTIVITY : PDConstants.TABLES.PD_LANE;
    var gr = new GlideRecord(tableName);
    gr.addQuery(PDConstants.TABLES.PD_PROCESS_DEFINITION, processDefinition);
    if (itemType === PDConstants.FIELDS.LANE)
        gr.addQuery(PDConstants.FIELDS.START_RULE, PDConstants.START_RULES.AFTER_LANES);
    if (itemType === PDConstants.FIELDS.ACTIVITY) {
        gr.addQuery(PDConstants.FIELDS.LANE, laneId);
        gr.addQuery(PDConstants.FIELDS.START_RULE, PDConstants.START_RULES.AFTER_ACTIVITIES);
    }
    gr.query();

    while (gr.next()) {
        var ge = (itemType === PDConstants.FIELDS.LANE) ? gr.getElement(PDConstants.FIELDS.START_RULE_VAR_AFTER_LANES) : gr.getElement(PDConstants.FIELDS.START_RULE_VAR_AFTER_ACTIVITIES);
        if (!ge)
            continue;
        var items = ge.getValue().split(',');
        if (!items.length)
            continue;
        var filteredArr = items.filter(function(startRuleVar) {
            return startRuleVar != sysId;
        });
        ge.setValue(filteredArr);
        gr.update();
    }
};

PDUtils.cleanUpOrderOnDelete = function(obj) {
    var laneId = obj.laneId;
    var processDefinition = obj.processDefinition;
    if (PDUtils.getProcessSchemaVersion(processDefinition) < 2)
        return;

    var deletedOrder = obj.deletedOrder;
    var itemType = obj.itemType;
    var tableName = itemType === PDConstants.FIELDS.ACTIVITY ? PDConstants.TABLES.PD_ACTIVITY : PDConstants.TABLES.PD_LANE;
    var gr = new GlideRecord(tableName);
    if (itemType === PDConstants.FIELDS.ACTIVITY) {
        var activityStartRules = PDConstants.START_RULES.AFTER_ACTIVITIES + "," + PDConstants.START_RULES.IMMEDIATE;
        gr.addQuery(PDConstants.FIELDS.LANE, laneId);
        gr.addQuery(PDConstants.FIELDS.PROCESS_DEFINITION, processDefinition);
        gr.addQuery(PDConstants.FIELDS.START_RULE, "IN", activityStartRules);
        gr.orderBy(PDConstants.FIELDS.ORDER);
    }
    if (itemType === PDConstants.FIELDS.LANE) {
        var laneStartRules = PDConstants.START_RULES.AFTER_LANES + "," + PDConstants.START_RULES.LANE_IMMEDIATELY;
        gr.addQuery(PDConstants.FIELDS.PROCESS_DEFINITION, processDefinition);
        gr.addQuery(PDConstants.FIELDS.START_RULE, "IN", laneStartRules);
        gr.orderBy(PDConstants.FIELDS.ORDER);
    }
    gr.query();

    while (gr.next()) {
        var itemOrder = gr.getValue(PDConstants.FIELDS.ORDER);
        if (itemOrder > deletedOrder) {
            gr.setValue(PDConstants.FIELDS.ORDER, itemOrder - 1);
            gr.setWorkflow(false); // not to run other BR that runs on record update
            gr.update();
        }
    }
};

PDUtils.getProcessSchemaVersion = function(sysId) {
    var gr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);
    var process = gr.get(sysId);
    if (process) {
        var schemaVersion = gr.getValue(PDConstants.FIELDS.SCHEMA_VERSION);
        if (gs.nil(schemaVersion))
            return 0;
        return schemaVersion;
    }
    return null;
};

PDUtils.getGlideVariablesMetadata = function(glideVarElement, variablesRecord) {
    var result = [];
    try {
        Object.keys(variablesRecord).forEach(function(variableName) {
            if (
                !variableName ||
                variableName === PDConstants.FIELDS.SYS_META ||
                variableName === PDConstants.FIELDS.SYS_ID
            )
                return;
            var variable = variablesRecord[variableName];
            var internalType = variable.getED().getInternalType();
            // DEF0348150 Inconsistent empty values
            var value = variable.getValue() || '';
            var displayValue = variable.getDisplayValue();

            var displayValuesWithPath = [];
            if (internalType == 'field_list') {
                displayValuesWithPath = PDUtils.getDisplayValuesWithPath(variable);
            }
            // DEF0348150 Inconsistent empty values
            if (internalType == 'boolean')
                value = displayValue;
            var ed = variable.getED();
			var attr = [];
			if (ed.getAttribute('dynamic')) attr.push('dynamic');
			if (ed.getAttribute('custom_schema')) attr.push('custom_schema=true');
            result.push({
                value: value,
                variableValue: value,
                displayValue: displayValue,
                internalType: internalType,
                label: variable.getLabel(),
                variableName: variable.getName(),
                variableMapping: variable.getValueMapping(),
                glideVarElement: glideVarElement,
                canRead: variable.canRead(),
                canWrite: variable.canWrite(),
                isMandatory: ed.isMandatory(),
                displayValuesWithPath: displayValuesWithPath,
                order: ed.getAttribute(PDConstants.FIELDS.ORDER),
                reference: variable.getReferenceTable(),
                hint: variable.getHint(),
                defaultValue: ed.getDefault(),
                referenceQualifier: ed.getReferenceQualifier(),
                maxLength: ed.getLength(),
                attributes: attr
            });
        });
    } catch (err) {
        return result;
    }
    return result;
};

PDUtils.getDisplayValuesWithPath = function(inputVariableElement) {
    var dependentOnField = inputVariableElement.getED().getDependent(); // inputs.table
    var dependentOnFieldName = dependentOnField.substring(
        dependentOnField.lastIndexOf('.') + 1
    ); // table
    var dependentOnFieldValue = inputVariableElement
        .getGlideRecord()
        .getElement(dependentOnFieldName)
        .getValue(); // incident
    if (gs.nil(dependentOnField) || gs.nil(dependentOnFieldValue)) return [];

    var referenceGR = new GlideRecord(dependentOnFieldValue);
    var elementValue = inputVariableElement.getValue();
    if (gs.nil(elementValue)) return [];

    var valuesArray = elementValue.split(',');
    var fullDisplayValue = [];
    for (var i = 0; i < valuesArray.length; i++) {
        var value = valuesArray[i];
        if (value.contains('.')) {
            var compositeElement = new GlideCompositeElement(
                value,
                dependentOnFieldValue
            );
            if (gs.nill(compositeElement)) return [];

            fullDisplayValue.push(
                PDUtils.getFullLabelWithSeparator(dependentOnFieldValue, value, '>')
            );
        } else {
            var fieldGlideElement = referenceGR.getElement(value);
            fullDisplayValue.push(fieldGlideElement.getLabel());
        }
    }
    return fullDisplayValue;
};

PDUtils.getFullLabelWithSeparator = function(tableName, fieldName, separator) {
    var fieldDescription = SNC.TableAndFieldDescription.getFieldDescription(
        tableName,
        fieldName
    );
    if (gs.nil(fieldDescription)) return;

    var fieldLabel = fieldDescription.getFieldLabel();
    var fieldLabelWithSeparator = fieldLabel.replace('.', separator);
    return fieldLabelWithSeparator;
};

PDUtils.updateStartWithDelay = function(startDelay, sourceId) {
    if (startDelay.timerAttributes && !startDelay.timerAttributes.sysId) {
        startDelay = PDUtils.deleteStartWithDelay(startDelay.timerAttributes);
    } else if (startDelay.timerAttributes) {
        startDelay = PDUtils.saveStartWithDelay(startDelay.timerAttributes);
    } else {
        var startDelayGr = new GlideRecord('sys_pd_timer_attributes');
        startDelayGr.addQuery('source', sourceId);
        startDelayGr.query();
        if (startDelayGr.next()) {
            startDelay = PDUtils.getStartWithDelay(startDelayGr);
        } else {
            startDelay = {};
        }
    }
    return startDelay;
};

PDUtils.saveStartWithDelay = function(timerAttributes) {
    var mappingFields = ['timer_duration', 'timer_relative_duration_datetime', 'timer_percentage', 'percentage_timer_input_datetime'];
    var normalFields = ['duration_type', 'timer_relative_duration_operator', 'timer_schedule'];

    var timerAttributesGr = new GlideRecord('sys_pd_timer_attributes');
    if (!timerAttributesGr.canCreate())
        return;

    var input = PDUtils.convertTopLevelObjectKeysToSnakeCase(timerAttributes);

    if (!timerAttributesGr.get(input.sys_id)) {
        // Get current record of Timer Attribute for mutation
        timerAttributesGr.setNewGuidValue(input.sys_id);
    }
    // This is a new record, set up the reference fields
    timerAttributesGr.process_definition = input.process_definition;
    timerAttributesGr.source = input.source;
    timerAttributesGr.source_type = input.source_type;

    normalFields.forEach(function(name) {
        timerAttributesGr[name] = input[name] ? input[name] : "";
    });

    mappingFields.forEach(function(name) {
        timerAttributesGr[name] = input[name] ? input[name].value : "";
        var mappingValue = input[name] ? input[name].variableMapping : "";
        timerAttributesGr.getElement(name).setValueMapping(mappingValue);
    });


    var updatedRecordSysId = timerAttributesGr.update();

    var updatedRecordGr = new GlideRecord('sys_pd_timer_attributes');
    updatedRecordGr.get(updatedRecordSysId);

    return PDUtils.getStartWithDelay(updatedRecordGr);
};

PDUtils.getStartWithDelay = function(startDelayGr) {
    return {
        sys_id: startDelayGr.getValue('sys_id'),
        duration_type: startDelayGr.getValue('duration_type'),
        process_definition: startDelayGr.getValue('process_definition'),
        source: startDelayGr.getValue('source'),
        source_type: startDelayGr.getValue('source_type'),
        percentage_timer_input_datetime: PDUtils.getFieldReturnValue(startDelayGr, 'percentage_timer_input_datetime'),
        timer_percentage: PDUtils.getFieldReturnValue(startDelayGr, 'timer_percentage'),
        timer_relative_duration_datetime: PDUtils.getFieldReturnValue(startDelayGr, 'timer_relative_duration_datetime'),
        timer_relative_duration_operator: startDelayGr.getValue('timer_relative_duration_operator'),
        timer_schedule: startDelayGr.getValue('timer_schedule'),
        timer_duration: PDUtils.getFieldReturnValue(startDelayGr, 'timer_duration')
    };
};

PDUtils.deleteStartWithDelay = function(timerAttributes) {
    var sourceValue = timerAttributes.source;

    var timerAttributesGr = new GlideRecord('sys_pd_timer_attributes');

    timerAttributesGr.addQuery('source', sourceValue);
    timerAttributesGr.query();

    while (timerAttributesGr.next()) {
        timerAttributesGr.deleteRecord();
    }

    return {};
};

PDUtils.setGlideRecordFieldValue = function(gr, field, value) {
    if (!gr || !field)
        return;
    if (PDUtils.isDisplayableStringValue(value))
        value = value.value;
    // Required when resetting a field to empty
    if (value === undefined || value === null)
        value = '';
    gr.setValue(field, value);
};

PDUtils.isDisplayableStringValue = function(value) {
    return ((value || {}).hasOwnProperty('value'));
};

PDUtils.isNullOrUndefined = function(value) {
    return value === undefined || value === null;
};

PDUtils.findMissingFields = function(object, mandatoryFields) {
    object = object || {};
    mandatoryFields = mandatoryFields || [];
    var missingFields = [];

    mandatoryFields.forEach(function(prop) {
        if (!object.hasOwnProperty(prop) || PDUtils.isNullOrUndefined(object[prop])) {
            missingFields.push(prop);
        }
    });

    return missingFields;
};

PDUtils.setGlideRecordFieldsValue = function(fields, gr) {
    for (var fieldName in fields) {
        var fieldValue = fields[fieldName];
        var snakeCaseFieldName = PDUtils.camelcaseToSnakecase(fieldName);
        switch (snakeCaseFieldName) {
            case PDConstants.FIELDS.SYS_ID:
                continue;
            default:
                PDUtils.setGlideRecordFieldValue(gr, snakeCaseFieldName, fieldValue);
        }
    }
};

PDUtils.isNowAssistForPlaybookPluginActive = function(enableLogging) {
    var isPluginActive = GlidePluginManager().isActive(PADConstants.PLUGINS.NOW_ASSIST_FOR_PLAYBOOK);
    if (enableLogging && !isPluginActive) {
        gs.info("PDUtils - Now Assist For Playbook plugin is not active");
    }
    return isPluginActive;
};

PDUtils.isPlaybookGenerationEnabledForUser = function(enableLogging) {
    if (this.isNowAssistForPlaybookPluginActive(enableLogging)) {
        var pdNowAssistUtils = new PDNowAssistUtils();
        pdNowAssistUtils.enableLogging(enableLogging);
        return pdNowAssistUtils.isPlaybookGenerationEnabledForUser();
    } else {
        return false;
    }
};

PDUtils.isPlaybookGenerationWithImageEnabledForUser = function() {
    if (this.isNowAssistForPlaybookPluginActive()) {
        var pdNowAssistUtils = new PDNowAssistUtils();
        return pdNowAssistUtils.isPlaybookGenerationWithImageEnabledForUser();
    }
};

PDUtils.isPlaybookGenerationWithKBEnabledForUser = function() {
    if (this.isNowAssistForPlaybookPluginActive()) {
        var pdNowAssistUtils = new PDNowAssistUtils();
        return pdNowAssistUtils.isPlaybookGenerationWithKBEnabledForUser();
    }
};

PDUtils.isPlaybookRecommendationsEnabledForUser = function() {
    if (this.isNowAssistForPlaybookPluginActive()) {
        var pdNowAssistUtils = new PDNowAssistUtils();
        return pdNowAssistUtils.isPlaybookRecommendationsEnabledForUser();
    }
};

PDUtils.isPlaybookSummarizationEnabledForUser = function() {
    if (this.isNowAssistForPlaybookPluginActive()) {
        var pdNowAssistUtils = new PDNowAssistUtils();
        return pdNowAssistUtils.isPlaybookSummarizationEnabledForUser();
    }
};

PDUtils.deleteRecordsBySysIds = function(idsStr, tableName) {
    if (!(idsStr || '').length)
        throw (gs.getMessage('No ids provided for deletion from {0}', [tableName]));

    var gr = PDUtils.newGlideRecordWithSkipProcessUpdate(tableName);

    gr.addQuery(PDConstants.FIELDS.SYS_ID, 'IN', idsStr);
    gr.query();
    gr.deleteMultiple();
};

PDUtils.deleteFlowDataDefinition = function(sysId) {
    this.flowDataDefinitionService = new PDFlowDataDefinitionService();
    var flowDataDefinitionGr = new GlideRecord(PDConstants.TABLES.FLOW_DATA_DEFINITION);
    flowDataDefinitionGr.get(sysId); // Flow Data Definition should have same sysId as the deleted activity record
    // query the record, check the existence of snapshot -- if it exists, keep the process_snapshot but remove the process_definition
    if (!PDUtils.isNullOrUndefined(flowDataDefinitionGr.getValue(PDConstants.FIELDS.PROCESS_SNAPSHOT))) {
        flowDataDefinitionGr.setValue(PDConstants.FIELDS.PROCESS_DEFINITION, '');
        flowDataDefinitionGr.update();
        return;
    }

    // Otherwise if it doesn't, then delete the flow definition sys Id (will also cascade delete associated flow data vars)
    var deleteFlowDataDefinitionResult = this.flowDataDefinitionService.deleteFlowDataDefinition(sysId);
    return deleteFlowDataDefinitionResult;
};

PDUtils.copyFlowDataVarsToNewFlowDataVars = function(oldId, newId) {
    var gr = new GlideRecord(PDConstants.TABLES.FLOW_DATA_VARIABLES);
    gr.addQuery('model', oldId);
    gr.query();

    while (gr.next()) {
        gr.model = newId;
        gr.insert();
    }
};

PDUtils.handleStartRuleChange = function(startRulePayload, gr) {
    var definition = startRulePayload.definition;
    var startRuleName = startRulePayload.startRuleName || '';
    var hasOldStartRule = (!startRuleName || startRuleName === '') && definition;

    // If old start rule is passed but no new start rule is given,
    // migrate to the new start rule format
    if (hasOldStartRule) {
        startRuleName = PDUtils.getNewStartRuleNameByOldDefinition(definition);
        gr.setValue(PDConstants.FIELDS.START_RULE_NAME, startRuleName || '');

        if (startRuleName === PDConstants.START_RULE_NAMES.AFTER_ITEMS) {
            var vars = startRulePayload.vars || {};
            var activities = vars.activities || [];
            var branches = vars.branches || [];
            var lanes = vars.lanes || [];

            var formattedBranches = branches
                .map(function(branch) {
                    return branch.activityId + '.' + branch.branchId;
                })
                .join(',');

            gr.setValue(PDConstants.FIELDS.STARTS_AFTER_ACTIVITIES, activities.join(','));
            gr.setValue(PDConstants.FIELDS.STARTS_AFTER_BRANCHES, formattedBranches);
            gr.setValue(PDConstants.FIELDS.STARTS_AFTER_LANES, lanes.join(','));
        }
    } else {
        // Handle new start rule
        gr.setValue(PDConstants.FIELDS.START_RULE_NAME, startRuleName || '');

        if (startRuleName === PDConstants.START_RULE_NAMES.AFTER_ITEMS) {
            var activities = (startRulePayload.startsAfterActivities || []).join(',');
            var branches = startRulePayload.startsAfterBranches || [];

            var formattedBranches = branches
                .map(function(branch) {
                    return branch.activityId + '.' + branch.branchId;
                })
                .join(',');

            var lanes = (startRulePayload.startsAfterLanes || []).join(',');

            gr.setValue(PDConstants.FIELDS.STARTS_AFTER_ACTIVITIES, activities);
            gr.setValue(PDConstants.FIELDS.STARTS_AFTER_BRANCHES, formattedBranches);
            gr.setValue(PDConstants.FIELDS.STARTS_AFTER_LANES, lanes);
        } else {
            // Clear all dependency fields if rule isn't AFTER_ITEMS
            gr.setValue(PDConstants.FIELDS.STARTS_AFTER_ACTIVITIES, '');
            gr.setValue(PDConstants.FIELDS.STARTS_AFTER_BRANCHES, '');
            gr.setValue(PDConstants.FIELDS.STARTS_AFTER_LANES, '');
        }
    }

    //clear the old start rule field
    gr.setValue(PDConstants.FIELDS.START_RULE, '');
};

PDUtils.copyPlaybookTranslations = function(fromProcessId, toProcessId) {
    if (!fromProcessId || !toProcessId) {
        return;
    }

    var inputTable = 'var__m_sys_pd_process_input_';
    PDUtils.copyFieldLabels(inputTable + fromProcessId, inputTable + toProcessId);
};

PDUtils.copyFieldLabels = function(originalName, newName) {
    // Step 1: Fetch all source field labels from original table
    var fdvGr = new GlideRecord(PDConstants.TABLES.SYS_DOCUMENTATION);
    fdvGr.addQuery(PDConstants.FIELDS.NAME, originalName);
    fdvGr.query();

    if (!fdvGr.hasNext()) {
        return;
    }

    var dataVars = [];
    while (fdvGr.next()) {
        dataVars.push({
            element: fdvGr.getValue(PDConstants.FIELDS.ELEMENT),
            language: fdvGr.getValue(PDConstants.FIELDS.LANGUAGE),
            label: fdvGr.getValue(PDConstants.FIELDS.LABEL),
            plural: fdvGr.getValue(PDConstants.FIELDS.PLURAL)
        });
    }

    // Step 2: Fetch all records in ONE query for new table
    var existingMap = {};
    var existingGr = new GlideRecord(PDConstants.TABLES.SYS_DOCUMENTATION);
    existingGr.addQuery(PDConstants.FIELDS.NAME, newName);
    existingGr.query();

    while (existingGr.next()) {
        var ekey = existingGr.getValue(PDConstants.FIELDS.ELEMENT) + '|' + existingGr.getValue(PDConstants.FIELDS.LANGUAGE);
        existingMap[ekey] = true;
    }

    // Step 3: insert only missing records
    for (var i = 0; i < dataVars.length; i++) {
        var dataVar = dataVars[i];
        var key = dataVar.element + '|' + dataVar.language;

        if (!existingMap[key]) {
            PDUtils._insertFieldLabel(newName, dataVar);
        }
    }
};

PDUtils._insertFieldLabel = function(table, dataVar) {
    var newDocGr = new GlideRecord(PDConstants.TABLES.SYS_DOCUMENTATION);
    newDocGr.initialize();
    newDocGr.setValue(PDConstants.FIELDS.NAME, table);
    newDocGr.setValue(PDConstants.FIELDS.ELEMENT, dataVar.element);
    newDocGr.setValue(PDConstants.FIELDS.LANGUAGE, dataVar.language);
    newDocGr.setValue(PDConstants.FIELDS.LABEL, dataVar.label);

    // Only set plural if it has a value
    if (dataVar.plural) {
        newDocGr.setValue(PDConstants.FIELDS.PLURAL, dataVar.plural);
    }

    newDocGr.insert();
};

PDUtils.updateChoiceRecords = function(dataDefinitionSysId, variable, previousDataDefinitionSysId) {
    if (!variable || !variable.choices || !variable.variableName) {
        throw (gs.getMessage('Invalid choice variable object provided'));
    }

    var sysFlowDataVarPrefix = 'var__m_sys_flow_data_var_';
    var choices = variable.choices;
    var element = variable.variableName;
    var table = sysFlowDataVarPrefix + dataDefinitionSysId;
    var previousDDTable = sysFlowDataVarPrefix + previousDataDefinitionSysId;

    for (var i = 0; i < choices.length; i++) {
        var choice = choices[i];

        // copy choice list (part of snapshotting the questionnaire)
        if (dataDefinitionSysId !== previousDataDefinitionSysId) {
            PDUtils._copyChoice(table, previousDDTable, choice, element);
        } else {
            // Upsert the choice
            PDUtils._upsertChoice(table, previousDDTable, choice, element);
        }
    }

    // Delete choices that were NOT in current choices, using the name and element as additional queries
    PDUtils._batchDeleteObsoleteChoices(table, element, choices);
};

PDUtils._copyChoice = function(table, previousDDTable, choice, element) {
    var label = choice.label;
    var value = choice.value;
    var sequence = choice.sequence;
    var systemLanguage = gs.getSession().getLanguage();

    var choiceGr = new GlideRecord(PDConstants.TABLES.SYS_CHOICE);
    choiceGr.addQuery(PDConstants.FIELDS.NAME, previousDDTable);
    choiceGr.addQuery(PDConstants.FIELDS.ELEMENT, element);
    choiceGr.addQuery(PDConstants.FIELDS.NAME, value);
    choiceGr.query();
    // a newly added choice
    if (!choiceGr.hasNext()) {
        choiceGr.setValue(PDConstants.FIELDS.ELEMENT, element);
        choiceGr.setValue(PDConstants.FIELDS.NAME, table);
        choiceGr.setValue(PDConstants.FIELDS.LABEL, label);
        choiceGr.setValue(PDConstants.FIELDS.VALUE, value);
        choiceGr.setValue(PDConstants.FIELDS.SEQUENCE, sequence);
        choiceGr.setValue(PDConstants.FIELDS.LANGUAGE, systemLanguage);
        choiceGr.insert();
    } else {
        while (choiceGr.next()) {
            var language = choiceGr.getValue(PDConstants.FIELDS.LANGUAGE);
            if (gs.nil(sequence)) {
                sequence = choiceGr.getValue(PDConstants.FIELDS.SEQUENCE);
            }
            choiceGr.setValue(PDConstants.FIELDS.ELEMENT, element);
            choiceGr.setValue(PDConstants.FIELDS.NAME, table);
            if (language !== systemLanguage) {
                label = choiceGr.getValue(PDConstants.FIELDS.LABEL);
            }
            choiceGr.setValue(PDConstants.FIELDS.LABEL, label);
            choiceGr.setValue(PDConstants.FIELDS.VALUE, value);
            if (sequence > 0) {
                choiceGr.setValue(PDConstants.FIELDS.SEQUENCE, sequence);
            }
            choiceGr.setValue(PDConstants.FIELDS.LANGUAGE, language);
            choiceGr.insert();
        }
    }
};

PDUtils._upsertChoice = function(table, previousTable, choice, element) {
    var label = choice.label;
    var value = choice.value;
    var sequence = choice.sequence;
    var systemLanguage = gs.getSession().getLanguage();

    var choiceGr = new GlideRecord(PDConstants.TABLES.SYS_CHOICE);
    choiceGr.addQuery(PDConstants.FIELDS.NAME, previousTable);
    choiceGr.addQuery(PDConstants.FIELDS.ELEMENT, element);
    choiceGr.addQuery(PDConstants.FIELDS.NAME, choice.value);
    choiceGr.addQuery(PDConstants.FIELDS.LANGUAGE, systemLanguage);
    choiceGr.query();
    choiceGr.next();

    choiceGr.setValue(PDConstants.FIELDS.ELEMENT, element);
    choiceGr.setValue(PDConstants.FIELDS.NAME, table);
    choiceGr.setValue(PDConstants.FIELDS.LABEL, choice.label);
    choiceGr.setValue(PDConstants.FIELDS.VALUE, choice.value);
    if (sequence > 0) {
        choiceGr.setValue(PDConstants.FIELDS.SEQUENCE, sequence);
    }
    choiceGr.insertOrUpdate(PDConstants.FIELDS.SYS_ID); // JS way to upsert is insertOrUpdate with the string "sys_id" as the parameter
};

PDUtils._batchDeleteObsoleteChoices = function(table, element, choices) {
    if (!choices || choices.length === 0) {
        return;
    }

    // Collect all choice values for deletion
    var currentChoicesValues = [];
    for (var i = 0; i < choices.length; i++) {
        currentChoicesValues.push(choices[i].value);
    }

    var choicesToDelete = new GlideRecord(PDConstants.TABLES.SYS_CHOICE);
    choicesToDelete.addQuery(PDConstants.FIELDS.NAME, table);
    choicesToDelete.addQuery(PDConstants.FIELDS.ELEMENT, element);
    choicesToDelete.addQuery(PDConstants.FIELDS.VALUE, 'NOT IN', currentChoicesValues.join(','));
    choicesToDelete.query();
    choicesToDelete.deleteMultiple();
};

PDUtils.objectValues = function(object) {
    if (!PDUtils.isObject(object)) {
        return object;
    }

    return Object.keys(object).map(function(key) {
        return object[key];
    });
};

PDUtils.isObject = function(value) {
    return value !== null && typeof value === 'object';
};

PDUtils.getParentTables = function(tableName) {
    if (!(tableName || '').length)
        throw (gs.getMessage('No tableName provided to get parent tables'));
    return GlideDBObjectManager.get().getTables(tableName).toArray().filter(function(name) {
        return name != tableName;
    });
};

PDUtils.getWorkflowStudioURL = function(processId, params) {
    var taxonomyGr = new GlideRecord(PDConstants.UDC_FILE_TAXONOMY.BUILDER_CONFIG_TABLE);
    taxonomyGr.get(PDConstants.UDC_FILE_TAXONOMY.BUILDER_CONFIG_ID);

    var path;
    if (processId) {
        path = taxonomyGr.getValue(PDConstants.UDC_FILE_TAXONOMY.EDIT_PATH_FIELD).replace("${sys_id}", processId);
    } else {
        // TODO: Remove this if block once app shell supports create path params
        if (params && params.generationRequestId) {
            return '/now/workflow-studio/builder?table=sys_pd_process_definition&sysId=-1&generationRequestId=' + params.generationRequestId;
        }
        path = taxonomyGr.getValue(PDConstants.UDC_FILE_TAXONOMY.CREATE_PATH_FIELD);
    }

    if (!PDUtils.isEmptyObject(params) && !path.endsWith("/")) {
        path = path + "/params/";
    }

    for (var param in params) {
        path = path + param + "/" + params[param] + "/";
    }

    return path;
};

PDUtils.getAttachmentAspectRatio = function(side1, side2) {
    var aspectRatio = side1 / side2;
    aspectRatio = aspectRatio.toFixed(2);
    return aspectRatio;
};

PDUtils.getScaledAttachmentSide = function(side1, side2) {
    var aspectRatio = this.getAttachmentAspectRatio(side1, side2);
    var scaledSide1 = side1;
    var scaledSide2 = side2;
    if (scaledSide1 > scaledSide2) {
        scaledSide1 = Math.round(PDConstants.ATTACHMENT.REDUCTION_RATIO * scaledSide1);
        if (scaledSide1 > PDConstants.ATTACHMENT.MAX_WIDTH_OR_HEIGHT) {
            scaledSide1 = PDConstants.ATTACHMENT.MAX_WIDTH_OR_HEIGHT;
        }
    } else {
        scaledSide2 = Math.round(PDConstants.ATTACHMENT.REDUCTION_RATIO * scaledSide2);
        if (scaledSide2 > PDConstants.ATTACHMENT.MAX_WIDTH_OR_HEIGHT) {
            scaledSide2 = PDConstants.ATTACHMENT.MAX_WIDTH_OR_HEIGHT;
        }
        scaledSide1 = Math.round(scaledSide2 * aspectRatio);
    }
    return scaledSide1;
};

PDUtils.getScaledAttachmentWidth = function(width, height) {
    return this.getScaledAttachmentSide(width, height);
};

PDUtils.getScaledAttachmentHeight = function(width, height) {
    return this.getScaledAttachmentSide(height, width);
};

PDUtils.deleteUnusedPDGenerationAttachments = function(fromDate, toDate) {
    var attachmentGr = new GlideRecord(PDConstants.TABLES.ATTACHMENT);
    attachmentGr.addQuery(PDConstants.FIELDS.TABLE_NAME, PDConstants.MISC.PREFIX_ZZ_YY + PDConstants.TABLES.PD_PROCESS_DEFINITION);
    if (!!fromDate) {
        attachmentGr.addQuery(PDConstants.FIELDS.SYS_CREATED_ON, '>=', fromDate);
    }
    if (!!toDate) {
        attachmentGr.addQuery(PDConstants.FIELDS.SYS_CREATED_ON, '<', toDate);
    }
    attachmentGr.query();
    while (attachmentGr.next()) {
        var attachmentId = attachmentGr.getUniqueValue();
        var pdProcessDefinitionId = attachmentGr.getValue(PDConstants.FIELDS.TABLE_SYS_ID);
        var pdProcessDefinitionGr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);
        if (!pdProcessDefinitionGr.get(pdProcessDefinitionId)) {
            var scaledAttachmentGr = new GlideRecord(PDConstants.TABLES.ATTACHMENT);
            scaledAttachmentGr.addQuery(PDConstants.FIELDS.TABLE_SYS_ID, attachmentId);
            scaledAttachmentGr.query();
            if (scaledAttachmentGr.hasNext()) {
                scaledAttachmentGr.deleteMultiple();
            }
            attachmentGr.deleteRecord();
        }
    }
};

PDUtils.getPlaybookTypeActivities = function(playbookTypeId) {
    var processTypeActivityMapping = new GlideRecord(PDConstants.TABLES.PD_PROCESS_TYPE_ACTIVITY_DEFINITION_MAP);
    processTypeActivityMapping.addQuery(PDConstants.FIELDS.PROCESS_TYPE, playbookTypeId);
    processTypeActivityMapping.query();
    return processTypeActivityMapping;
};

PDUtils.getDefaultPermission = function() {
    return '{}';
};

PDUtils.getDefaultLanePermission = function() {
    return '{}';
};

PDUtils.getFormViewsForTable = function(associatedTable) {

    var getUIViewIds = function(associatedTable, formViewTable) {
        var gr = new GlideRecord(formViewTable);
        gr.addQuery('name', associatedTable);
        var maxFormViewResults = gs.getProperty('com.glide.pad.core.model.maxFormViewGraphqlResults', 200);
        gr.setLimit(maxFormViewResults);
        gr.setOffset(0);
        gr.query();

        var uiViewIds = [];
        while (gr.next()) {
            uiViewIds.push(gr.getValue('view'));
        }
        return uiViewIds;
    };

    var getUIViewData = function(uiViewIds) {
        var results = [];
        if (uiViewIds.length === 0) {
            return results;
        }

        var grUIView = new GlideRecord('sys_ui_view');
        grUIView.addQuery('sys_id', 'IN', uiViewIds);
        grUIView.query();

        while (grUIView.next()) {
            results.push({
                sysId: grUIView.getValue('sys_id'),
                title: grUIView.getValue('title'),
                name: grUIView.getValue('name')
            });
        }
        return results;
    };

    var formIds = getUIViewIds(associatedTable, 'sys_ui_form');
    var sectionIds = getUIViewIds(associatedTable, 'sys_ui_section');

    var allIds = formIds.concat(sectionIds);
    var combinedResults = getUIViewData(allIds);

    return combinedResults;
};

PDUtils.getAdditionalFunctionality = function(activityGr) {
    var FIELDS = PDConstants.FIELDS;
    var activityDefGr = activityGr[FIELDS.ACTIVITY_DEFINITION].getRefRecord();
    if (!activityDefGr || !activityDefGr.canRead())
        return;
    return activityDefGr.getValue(FIELDS.ADDITIONAL_FUNCTIONALITY);
};

PDUtils.shouldRunProcessDefinitionBRs = function(fields) {
    fields = fields || {};

    // When fields only contains sysId, it is not a process definition update
    if (PDUtils.isEmptyObject(fields, ['sysId'])) {
        return false;
    }

    // Check if any fields that should trigger BRs are being updated
    var processDefinitionFieldsWithBRs = PDConstants.PROCESS_DEFINITION_FIELDS_WITH_BRS || [];
    for (var i = 0; i < processDefinitionFieldsWithBRs.length; i++) {
        if (fields.hasOwnProperty(processDefinitionFieldsWithBRs[i])) {
            return true;
        }
    }

    return false;
};

PDUtils.getDisplayNames = function(sysIdsInTables) {
    var validTables = ['sys_user', 'sys_user_group', 'sys_user_role', 'user_criteria'];
    var results = [];
    for (var i = 0; i < sysIdsInTables.length; i++) {
        var tableName = sysIdsInTables[i].tableName;
        if (validTables.indexOf(tableName) < 0) {
            continue;
        }
        var tableGr = new GlideRecord(tableName);
        tableGr.addQuery('sys_id', 'IN', sysIdsInTables[i].sysIds.join(','));
        tableGr.query();

        var result = {
            tableName: tableName,
            displayNamesForSysIds: []
        };
        while (tableGr.next()) {
            result.displayNamesForSysIds.push({
                sysId: tableGr.getUniqueValue(),
                displayName: tableGr.getDisplayValue()
            });
        }
        results.push(result);
    }
    return results;
};

PDUtils.getNewStartRuleNameByOldDefinition = function(definition) {
    switch (definition) {
        case PDConstants.START_RULES.IMMEDIATE:
        case PDConstants.START_RULES.LANE_IMMEDIATELY:
            return PDConstants.START_RULE_NAMES.IMMEDIATE;
        case PDConstants.START_RULES.AFTER_ACTIVITIES:
        case PDConstants.START_RULES.AFTER_LANES:
            return PDConstants.START_RULE_NAMES.AFTER_ITEMS;
        case PDConstants.START_RULES.MANUAL:
            return PDConstants.START_RULE_NAMES.MANUAL;
        default:
            return '';
    }
};

PDUtils.addStartRuleV2Schema = function(startRule, isProcessLevel, isActvitiy) {
    if (!startRule || startRule.definition) {
        return startRule;
    }

    result = {
        vars: {
            activities: [],
            branches: [],
            lanes: []
        }
    };
    if (startRule.startRuleName === PDConstants.START_RULE_NAMES.AFTER_ITEMS) {
        result.definition = isProcessLevel ? PDConstants.START_RULES.AFTER_LANES : PDConstants.START_RULES.AFTER_ACTIVITIES;
        result.vars.branches = startRule.startsAfterBranches;
        result.vars.activities = startRule.startsAfterActivities;
        result.vars.lanes = startRule.startsAfterLanes;
    } else if (startRule.startRuleName === PDConstants.START_RULE_NAMES.IMMEDIATE) {
        result.definition = isActvitiy ? PDConstants.START_RULES.IMMEDIATE : PDConstants.START_RULES.LANE_IMMEDIATELY;
    } else if (startRule.startRuleName === PDConstants.START_RULE_NAMES.MANUAL) {
        result.definition = PDConstants.START_RULES.MANUAL;
    }
    result.startRuleName = startRule.startRuleName;
    result.startsAfterActivities = startRule.startsAfterActivities;
    result.startsAfterLanes = startRule.startsAfterLanes;
    result.startsAfterBranches = startRule.startsAfterBranches;

    return result;
};

PDUtils.transformStartsAfterBranches = function(branchesStr) {
    if (!branchesStr) return [];

    return branchesStr.split(",").map(function(branch) {
        var splitBranch = branch.split('.');
        return {
            activityId: splitBranch[0],
            branchId: splitBranch[1]
        };
    });
};

PDUtils.isParentProcessValid = function(gr, parentFieldName) {
    // Do not use getRefRecord here, as there is an issue if this is run on a cascading delete
    var fieldName = parentFieldName || PDConstants.FIELDS.PROCESS_DEFINITION;
    var processGr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);
    processGr.get(gr.getValue(fieldName));
    return processGr.isValidRecord();
};

PDUtils.isOptionalActivity = function(gr) {
    return gr.getValue(PDConstants.FIELDS.START_RULE) == PDConstants.START_RULES.MANUAL || gr.getValue(PDConstants.FIELDS.START_RULE_NAME) == PDConstants.START_RULE_NAMES.MANUAL;
};

PDUtils.isDecisionStage = function(gr) {
    return gr.getElement(PDConstants.FIELDS.LANE).nil() && !PDUtils.isOptionalActivity(gr);
};

PDUtils.findPublicPDsByActivityDefinition = function(adSysId) {
    var publicPDs = [];
    var pdSet = {};
    var restrictedCount = 0;

    var actGR = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY);
    actGR.addQuery(PDConstants.FIELDS.ACTIVITY_DEFINITION, adSysId);
	actGR.addQuery(PDConstants.FIELDS.PROCESS_DEFINITION + '.' + PDConstants.FIELDS.PUBLIC_ACCESS , true);

    actGR.query();

    while (actGR.next()) {
        var pdSysId = actGR.getValue(PDConstants.FIELDS.PROCESS_DEFINITION);

        // Check if we've already seen this PD
        if (pdSysId && !pdSet[pdSysId]) {
            pdSet[pdSysId] = true;

            var pdGR = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);
            if (pdGR.get(pdSysId)) {
                if (!pdGR.canRead()) {
                    restrictedCount++;
                    continue;
                }
                // ServiceNow returns '1' for true
                if (pdGR.getValue(PDConstants.FIELDS.PUBLIC_ACCESS) == '1') {
                    publicPDs.push({
                        name: pdGR.getDisplayValue(),
                        sys_id: pdGR.getValue('sys_id')
                    });
                }
            }
        }
    }

    return {
        publicPDs: publicPDs,
        restrictedCount: restrictedCount
    };
};
PDUtils.isFormBasedActivityType = function(sysId) {

    var formBasedElements = ['form_view', 'form_fields'];
    var activityTypeGr = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY_TYPE_PROP);
    activityTypeGr.addQuery(PDConstants.FIELDS.MODEL, sysId);
    activityTypeGr.addQuery(PDConstants.FIELDS.ELEMENT, 'IN', formBasedElements);
    activityTypeGr.query();
    return activityTypeGr.hasNext();
};
PDUtils.getParentTableOfProcessDefinition = function(pdSysId) {
    var processInput = new GlideRecord(PDConstants.TABLES.PD_PROCESS_INPUT);
    processInput.addQuery(PDConstants.FIELDS.MODEL, pdSysId);
    processInput.addQuery(PDConstants.FIELDS.ELEMENT, PDConstants.FIELDS.PARENT_RECORD);
    processInput.query();
    if (processInput.next()) {
        return processInput.getValue(PDConstants.FIELDS.REFERENCE);
    }
    return null;
};

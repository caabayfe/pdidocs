var PDTriggerInstanceRepository = Class.create();
PDTriggerInstanceRepository.prototype = {
    initialize: function() {
        this.table = PDConstants.TABLES.PD_TRIGGER_INSTANCE;
    },
    type: 'PDTriggerInstanceRepository',

    getTriggerInstancesByProcessDefinition: function(processDefinitionId) {
        var triggerInstances = [];
        var triggerInstanceRecord;
        var triggerInstanceGR = new GlideRecord(this.table);
        triggerInstanceGR.addQuery(PDConstants.FIELDS.PROCESS_DEFINITION, processDefinitionId);
        triggerInstanceGR.query();
        while (triggerInstanceGR.next()) {
            triggerInstanceRecord = triggerInstanceGR;

            triggerInstances.push(
                this._generateTriggerRecordData(triggerInstanceRecord)
            );
        }
        return triggerInstances;
    },

    insertTriggerInstances: function(processDefinitionId, triggerInstances) {
        var insertedTriggerInstances = triggerInstances.map(function(fields) {
            var insertedGr = this._handleTriggerInputChanges(processDefinitionId, fields);
            if (fields.triggerLabel) {
                insertedGr.setValue(PDConstants.FIELDS.LABEL, fields.triggerLabel);
                insertedGr.update();
            }
            return this._generateTriggerRecordData(insertedGr);
        }.bind(this));
        return insertedTriggerInstances;
    },

    updateTriggerInstances: function(processDefinitionId, triggerInstances, processSchemaVersion) {
        var updatedTriggerInstances = triggerInstances.map(function(fields) {
            var copiedFields = PDUtils.shallowClone(fields);
            copiedFields.processSchemaVersion = processSchemaVersion;
            var updatedGr = this._handleTriggerInputChanges(processDefinitionId, copiedFields);
            if (fields.triggerLabel) {
                updatedGr.setValue(PDConstants.FIELDS.LABEL, fields.triggerLabel);
                updatedGr.update();
            }
            return this._generateTriggerRecordData(updatedGr);
        }.bind(this));
        return updatedTriggerInstances;
    },

    deleteTriggerInstances: function(triggerInstanceIdsStr) {
        if (!triggerInstanceIdsStr || triggerInstanceIdsStr.length === 0)
            throw (gs.getMessage('No trigger instances to delete'));

        var gr = PDUtils.newGlideRecordWithSkipProcessUpdate(this.table);
        gr.addQuery('sys_id', 'IN', triggerInstanceIdsStr);
        gr.query();
        gr.deleteMultiple();
    },

    _handleTriggerInputChanges: function(processDefinitionId, field) {
        field = field || {};
        // Latest schema version uses sysId; legacy uses triggerInstanceId
        var triggerInstanceId = field.sysId || field.triggerInstanceId;
        if (!triggerInstanceId) {
            return {};
        }
        var triggerType = (field.triggerType || {}).value;
        var triggerDefinition = field.triggerDefinition;
        var triggerInstanceGR = new GlideRecord(this.table);
        if (!triggerInstanceGR.get(triggerInstanceId)) {
            if (triggerDefinition) {
                this._insertTriggerInstanceFromDefinition(processDefinitionId, triggerInstanceId, triggerDefinition);
            } else if (triggerType) {
                this._insertTriggerInstance(processDefinitionId, triggerInstanceId, triggerType);
            }

            // Make sure we get the latest record state after insertion
            triggerInstanceGR.get(triggerInstanceId)
        }
        var newInputs = (field.inputs || {}).variables || [];
        try {
            if (newInputs.length) {
                newInputs.forEach(function(variable) {
                    variable = variable || {};
                    if (variable.variableName) {
                        var glideVarElement = variable.glideVarElement || PDConstants.FIELDS.TRIGGER_INPUTS;
                        var variableElement = triggerInstanceGR.getElement(glideVarElement + '.' + variable.variableName);
                        variableElement.setValue(variable.value || variable.variableValue || '');
                        // to support pill display value on initial load, we store displayValue in here. This will work for nonpill as well
                        if (variable.displayValue) variableElement.setDisplayValue(variable.displayValue);
                        if (variable.variableMapping) {
                            variableElement.setValueMapping(variable.variableMapping || '');
                        } else {
                            // we should clear valueMapping out if it's not a pill to preserve the exclusive relationship between mapping and value
                            variableElement.setValueMapping('');
                        }
                    }
                });
                triggerInstanceGR.update();
            }
        } catch (err) {
            throw gs.getMessage(
                'Unable to update inputs for trigger instance with id: {0}', triggerInstanceId);
        }
        return triggerInstanceGR;
    },

    _insertTriggerInstance: function(processDefinitionId, triggerInstanceId, triggerType) {
        var gr = PDUtils.newGlideRecordWithSkipProcessUpdate(this.table);
        gr.setNewGuidValue(triggerInstanceId);
        gr.setValue(PDConstants.FIELDS.PROCESS_DEFINITION, processDefinitionId);
        gr.setValue(PDConstants.FIELDS.TRIGGER_TYPE, triggerType);
        if (!gr.insert())
            throw (gs.getMessage(
                'Unable to insert new trigger instance for process with id: {0}', processDefinitionId));
    },

    _insertTriggerInstanceFromDefinition: function(processDefinitionId, triggerInstanceId, triggerDefinition) {
        var definitionGR = new GlideRecord(PDConstants.TABLES.PD_TRIGGER_DEFINITION_TABLE);
        if (!definitionGR.get(triggerDefinition))
            throw (gs.getMessage(
                'Unable to find trigger definition with id: {0}', triggerDefinition));
        var instanceGR = PDUtils.newGlideRecordWithSkipProcessUpdate(this.table);
        instanceGR.setNewGuidValue(triggerInstanceId);
        instanceGR.setValue(PDConstants.FIELDS.LABEL, definitionGR.getValue(PDConstants.FIELDS.LABEL));
        instanceGR.setValue(PDConstants.FIELDS.NAME, definitionGR.getValue(PDConstants.FIELDS.NAME));
        instanceGR.setValue(PDConstants.FIELDS.TRIGGER_DEFINITION, triggerDefinition);
        instanceGR.setValue(PDConstants.FIELDS.TRIGGER_TYPE, definitionGR.getValue(PDConstants.FIELDS.TRIGGER_TYPE));
        instanceGR.setValue(PDConstants.FIELDS.PROCESS_DEFINITION, processDefinitionId);
        if (!instanceGR.insert())
            throw (gs.getMessage(
                'Unable to insert new trigger instance for process with id: {0}', processDefinitionId));
    },

    _generateTriggerRecordData: function(triggerInstanceRecord) {
        var triggerInputGe = triggerInstanceRecord.getElement(PDConstants.FIELDS.TRIGGER_INPUTS);
        var playbookInputGe = triggerInstanceRecord.getElement(PDConstants.FIELDS.PLAYBOOK_INPUTS);
        var triggerInputsVariablesRecord = triggerInputGe.getVariablesRecord();
        var playbookInputsVariablesRecord = playbookInputGe.getVariablesRecord();

        if (!triggerInstanceRecord || !triggerInputsVariablesRecord)
            return null;
        var triggerRecordData = {
            sysId: null,
            triggerInstanceId: null,
            inputs: {
                variables: []
            },
            triggerType: {},
            triggerDefinition: null
        };
        triggerRecordData.inputs.variables =
            PDUtils.getGlideVariablesMetadata(PDConstants.FIELDS.TRIGGER_INPUTS, triggerInputsVariablesRecord);
        if (playbookInputsVariablesRecord)
            triggerRecordData.inputs.variables = triggerRecordData.inputs.variables.concat(
                PDUtils.getGlideVariablesMetadata(PDConstants.FIELDS.PLAYBOOK_INPUTS, playbookInputsVariablesRecord)
            );
        triggerRecordData.sysId =
            triggerInstanceRecord.getUniqueValue();
        triggerRecordData.triggerInstanceId =
            triggerInstanceRecord.getUniqueValue();
        triggerRecordData.triggerType =
            PDUtils.getFieldReturnValue(
                triggerInstanceRecord, PDConstants.FIELDS.TRIGGER_TYPE);
        triggerRecordData.triggerDefinition =
            triggerInstanceRecord.getValue(
                PDConstants.FIELDS.TRIGGER_DEFINITION);
        triggerRecordData.triggerLabel =
            triggerInstanceRecord.getValue(
                PDConstants.FIELDS.LABEL);
        return triggerRecordData;
    }
};

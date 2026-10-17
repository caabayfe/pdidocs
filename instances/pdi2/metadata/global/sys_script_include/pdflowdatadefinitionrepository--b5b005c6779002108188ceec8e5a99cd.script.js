var PDFlowDataDefinitionRepository = Class.create();
PDFlowDataDefinitionRepository.prototype = {
    initialize: function() {},
    insertFlowDataDefinition: function(fields) {
        fields = fields || {};
        var gr = new GlideRecord(PDConstants.TABLES.FLOW_DATA_DEFINITION);
        var name = fields.name;
        var processDefinition = fields.processDefinition;

        // the user can optionally pass in a sysId to hardcode the record to
        var sysId = fields['sysId'];
        gr.initialize();
        if (!name)
            throw gs.getMessage('Missing name value');
        if (sysId)
            gr.setNewGuidValue(sysId);

        PDUtils.setGlideRecordFieldValue(gr, 'name', name);
        PDUtils.setGlideRecordFieldValue(gr, PDConstants.FIELDS.PROCESS_DEFINITION, processDefinition);
        var insertedId = gr.insert();

        if (!insertedId) {
            var errorRecordId = sysId || '';
            throw gs.getMessage('Unable to insert flow data definition {0}: {1}', [errorRecordId, gr.getLastErrorMessage()]);
        }
        return this._getFlowDataDefinitionFromGR(gr);
    },
    updateFlowDataVariables: function(newDataDefinition, previousDataDefinitionSysId) {
        var dataDefinitionSysId = newDataDefinition.sysId;
        if (!dataDefinitionSysId)
            throw gs.getMessage('Missing data definition sys_id');

        var newVariables = newDataDefinition.flowDataVariables && newDataDefinition.flowDataVariables.variables ? newDataDefinition.flowDataVariables.variables : [];
        var oldVariables = {};
        var variablesPositionChange = {};
        var currentGr;
        var uiSectionId;
        var sysFlowDataVarVirtualTable = "var__m_" + PDConstants.TABLES.FLOW_DATA_VARIABLES + "_" + dataDefinitionSysId;

        var keyMap = {
            // Add more mappings as needed
            variableValue: 'label',
            variableName: 'element',
            referenceQualifier: 'reference_qual_condition',
            maxLength: 'max_length',
            choices: 'choices',
            choiceField: 'choice_field',
            choiceTable: 'choice_table'
        };

        // only query if we have new variables to compare against
        if (newVariables.length > 0) {
            // logic to figure out diff
            currentGr = new GlideRecord(PDConstants.TABLES.FLOW_DATA_VARIABLES);
            currentGr.addQuery('model', dataDefinitionSysId);
            currentGr.query();

            while (currentGr.next()) {
                oldVariables[currentGr.getValue('element')] = currentGr.getValue('internal_type');
            }

            // table used for question order
            uiSectionId = this._initializeUISection(sysFlowDataVarVirtualTable);
        }

        for (var i = 0; i < newVariables.length; i++) {
            var newVariable = newVariables[i];
            var order = i;

            // STRY57374718: db prevents boolean type glide vars from changing type, so we need to delete and re-add
            if (oldVariables[newVariable.variableName] && oldVariables[newVariable.variableName] === "boolean" && newVariable.internalType !== "boolean") {
                delete oldVariables[newVariable.variableName]; // remove from lookup so we fall into the add logic
                // delete the old variable
                var deleteBoolTypeGr = new GlideRecord(PDConstants.TABLES.FLOW_DATA_VARIABLES);
                deleteBoolTypeGr.addQuery('model', dataDefinitionSysId);
                deleteBoolTypeGr.addQuery('element', newVariable.variableName);
                deleteBoolTypeGr.query();
                deleteBoolTypeGr.deleteMultiple();
            }

            // if the variable does NOT exist in the old variables, it was added.
            if (!oldVariables[newVariable.variableName]) {
                // Object keys the newVariable object and update whatever value that exists, except the variableName key because that's the identifer
                currentGr.newRecord();
                var ignoreList = ['variableMapping'];
                for (var newKey in newVariable) {
                    if (ignoreList.indexOf(newKey) === -1) {
                        var mappedKey = keyMap[newKey] || PDUtils.camelcaseToSnakecase(newKey);
                        var item = newVariable[newKey];
                        var newValue = item ? (item.value || item) : item;
                        if (item && item.hasOwnProperty('value') && gs.nil(item.value)) {
                            newValue = '';
                        }
                        currentGr.setValue(mappedKey, newValue);
                    }
                }
                currentGr.setValue(PDConstants.FIELDS.NAME, sysFlowDataVarVirtualTable);
                currentGr.setValue(PDConstants.FIELDS.MODEL, dataDefinitionSysId);

                currentGr.insert();
            }
            // Choices work a bit differently as they are a separate related list, we will recreate the choices every time they change.
            // We upsert new and existing records, and delete ones that no longer exist.
            // Radio works the same way as choice.
            // Only process manual choices (not dynamic choices from table fields)
            if ((newVariable.internalType === "choice" || newVariable.internalType === "radio") &&
                newVariable.choices && Array.isArray(newVariable.choices) && newVariable.choices.length > 0) {
                PDUtils.updateChoiceRecords(dataDefinitionSysId, newVariable, previousDataDefinitionSysId);
            }

            // add or update the variable (question) order
            this._addUpdateGlideVarOrder(newVariable.variableName, order, uiSectionId);

            // if the variable is found, loop through the fields and update the fields that were returned. If no field was updated, it will only have the variableName
            if (oldVariables[newVariable.variableName] && Object.keys(newVariable).length > 1) {
                // loop through the newVariable fields and update them
                var updateGr = new GlideRecord(PDConstants.TABLES.FLOW_DATA_VARIABLES);
                updateGr.addQuery(PDConstants.FIELDS.MODEL, dataDefinitionSysId);
                updateGr.addQuery(PDConstants.FIELDS.ELEMENT, newVariable.variableName);
                updateGr.query();
                if (updateGr.next()) {
                    for (var key in newVariable) {
                        var mappedUpdateKey = keyMap[key] || PDUtils.camelcaseToSnakecase(key);
                        var obj = newVariable[key];
                        var value = (obj && obj.value) || obj;
                        if (obj && obj.hasOwnProperty('value') && gs.nil(obj.value))
                            value = '';
                        updateGr.setValue(mappedUpdateKey, value);
                    }
                    updateGr.update();
                }
            }
        }

        // if data definition has changed this is a snapshot/copy scenario
        // copy all field labels including alt language labels over to new virtual table
        if (dataDefinitionSysId !== previousDataDefinitionSysId) {
            var sysFlowDataVarVirtualTablePrevious = "var__m_" + PDConstants.TABLES.FLOW_DATA_VARIABLES + "_" + previousDataDefinitionSysId;
            PDUtils.copyFieldLabels(sysFlowDataVarVirtualTablePrevious, sysFlowDataVarVirtualTable);
        }

        // Clean up deleted variables
        this._deleteFlowDataVariables(newVariables, dataDefinitionSysId);
        // Clean up ui elements for deleted variables
        this._deleteUIElements(newVariables, uiSectionId);
    },

    deleteFlowDataDefinition: function(dataDefinitionId) {
        if (!dataDefinitionId)
            throw (gs.getMessage('No flow data definition to delete'));

        var gr = new GlideRecord(PDConstants.TABLES.FLOW_DATA_DEFINITION);
        gr.get(dataDefinitionId);

        var deleteResult = gr.deleteRecord();
        if (!deleteResult)
            throw (gs.getMessage('There was an error deleting the data definition'));
        return deleteResult;
    },

    _deleteFlowDataVariables: function(newVariables, dataDefinitionSysId) {
        var deleteGr = new GlideRecord(PDConstants.TABLES.FLOW_DATA_VARIABLES);
        var newListElements = newVariables.map(function(obj) {
            return obj.variableName;
        }).join(',');

        deleteGr.addQuery(PDConstants.FIELDS.MODEL, dataDefinitionSysId);
        deleteGr.addQuery(PDConstants.FIELDS.ELEMENT, 'NOT IN', newListElements);
        deleteGr.query();
        deleteGr.deleteMultiple();
    },

    _deleteUIElements: function(newVariables, uiSectionId) {
        if (!uiSectionId) {
            return;
        }
        var deleteGr = new GlideRecord(PDConstants.TABLES.UI_ELEMENT);
        var newListElements = newVariables.map(function(obj) {
            return obj.variableName;
        }).join(',');

        deleteGr.addQuery(PDConstants.TABLES.UI_SECTION, uiSectionId);
        deleteGr.addQuery(PDConstants.FIELDS.ELEMENT, 'NOT IN', newListElements);
        deleteGr.query();
        deleteGr.deleteMultiple();
    },

    _getFlowDataDefinitionFromGR: function(gr) {
        var FIELDS = PDConstants.FIELDS;
        return {
            sys_id: PDUtils.getFieldReturnValue(gr, FIELDS.SYS_ID).value,
            name: PDUtils.getFieldReturnValue(gr, FIELDS.NAME).value,
            sys_created_on: PDUtils.getFieldReturnValue(gr, FIELDS.SYS_CREATED_ON).value,
            sys_updated_on: PDUtils.getFieldReturnValue(gr, FIELDS.SYS_UPDATED_ON).value
        };
    },

    _initializeUISection: function(sysFlowDataVarTable) {
        var uiSectionGr = new GlideRecord(PDConstants.TABLES.UI_SECTION);
        if (!uiSectionGr.get(PDConstants.FIELDS.NAME, sysFlowDataVarTable)) {
            uiSectionGr.initialize();
            uiSectionGr.setValue(PDConstants.FIELDS.NAME, sysFlowDataVarTable);
            uiSectionGr.setValue(PDConstants.FIELDS.CAPTION, sysFlowDataVarTable);
            uiSectionGr.setValue(PDConstants.FIELDS.VIEW, 'Default view');
            uiSectionGr.setValue(PDConstants.FIELDS.TITLE, true);
            return uiSectionGr.insert();
        }
        return uiSectionGr.getUniqueValue();
    },

    _addUpdateGlideVarOrder: function(variableName, order, uiSectionId) {
        if (!uiSectionId) {
            return;
        }
        var uiElementGr = new GlideRecord(PDConstants.TABLES.UI_ELEMENT);
        uiElementGr.addQuery(PDConstants.FIELDS.ELEMENT, variableName);
        uiElementGr.addQuery(PDConstants.TABLES.UI_SECTION, uiSectionId);
        uiElementGr.query();
        if (uiElementGr.next()) {
            uiElementGr.setValue(PDConstants.FIELDS.POSITION, order);
            uiElementGr.update();
        } else {
            uiElementGr.initialize();
            uiElementGr.setValue(PDConstants.TABLES.UI_SECTION, uiSectionId);
            uiElementGr.setValue(PDConstants.FIELDS.ELEMENT, variableName);
            uiElementGr.setValue(PDConstants.FIELDS.POSITION, order);
            uiElementGr.insert();
        }
    },

    type: 'PDFlowDataDefinitionRepository'
};

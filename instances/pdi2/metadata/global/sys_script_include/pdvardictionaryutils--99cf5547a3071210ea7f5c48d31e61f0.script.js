var PDVarDictionaryUtils = Class.create();
PDVarDictionaryUtils.prototype = {
    initialize: function() {},
    type: 'PDVarDictionaryUtils',
    _getVariableTableName: function(varDictTable, processId) {
        return 'var__m_' + varDictTable + '_' + processId;
    },
    getVariables: function(varDictTable, processId) {
        const varDictGr = new GlideRecord(this._getVariableTableName(varDictTable, processId));
        const elementsList = varDictGr.getElements();
        const variables = [];

        for (var i = 0; i < elementsList.size(); i++) {
            const element = elementsList.get(i);
            const name = element.getName();

            // Skip sys_id element
            if (name === PDConstants.FIELDS.SYS_ID) {
                continue;
            }

            const ed = element.getED();
            const variable = {
                variableName: name,
                variableMapping: element.getValueMapping(),
                label: element.getLabel(),
                displayValue: element.getDisplayValue(),
                internalType: ed.getInternalType(),
                isMandatory: ed.isMandatory(),
                canRead: element.canRead(),
                canWrite: element.canWrite(),
                reference: element.getReferenceTable(),
                hint: element.getHint(),
                defaultValue: ed.getDefault(),
                referenceQualifier: ed.getReferenceQualifier(),
                maxLength: ed.getLength(),
                order: ed.getAttribute(PDConstants.FIELDS.ORDER)
            };
            variables.push(variable);
        }

        return {
            variables: PDUtils.objectValues(variables)
        };
    },
    _setCommonVarDictionaryFields: function(varDictGr, variable) {
        varDictGr.setValue(PDConstants.FIELDS.INTERNAL_TYPE, variable.internalType);
        varDictGr.setValue(PDConstants.FIELDS.LABEL, variable.label);
        varDictGr.setValue(PDConstants.FIELDS.COLUMN_LABEL, variable.label);
        varDictGr.setValue(PDConstants.FIELDS.MANDATORY, variable.mandatory);
        varDictGr.setValue(PDConstants.FIELDS.HINT, variable.hint);
        varDictGr.setValue(PDConstants.FIELDS.DEFAULT_VALUE, variable.defaultValue);
        varDictGr.setValue(PDConstants.FIELDS.REFERENCE, variable.reference);
        varDictGr.setValue(PDConstants.FIELDS.REFERENCE_QUALIFIER_CONDITION, variable.referenceQualifier);
        varDictGr.setValue(PDConstants.FIELDS.MAX_LENGTH, variable.maxLength);
        varDictGr.setValue(PDConstants.FIELDS.ORDER, variable.order);
    },
    updateVariables: function(varDictTable, processId, variablesObj) {
        // No need trigger update set changes everytime as it will be captured in PDSynchronizer at the end.
        const varDictGr = PDUtils.newGlideRecordWithSkipProcessUpdate(varDictTable);
        const variableTableName = this._getVariableTableName(varDictTable, processId);

        const {
            variables
        } = variablesObj;
        variables.forEach((variable) => {
            varDictGr.initialize();
            varDictGr.addQuery(PDConstants.FIELDS.NAME, variableTableName);
            varDictGr.addQuery(PDConstants.FIELDS.MODEL, processId);
            varDictGr.addQuery(PDConstants.FIELDS.ELEMENT, variable.variableName);
            varDictGr.query();

            const recordExists = varDictGr.next() && varDictGr.isValidRecord();
            let createNewRecord = !recordExists;

            if (recordExists) {
                // If updating type from boolean to something else, we need to create a new record instead (DB limitation)
                const existingType = varDictGr.getValue(PDConstants.FIELDS.INTERNAL_TYPE);
                createNewRecord = existingType === 'boolean' && existingType !== variable.internalType;
                if (createNewRecord) {
                    varDictGr.deleteRecord();
                }
            }

            if (createNewRecord) {
                // Insert new records
                varDictGr.initialize();
                varDictGr.setValue(PDConstants.FIELDS.NAME, variableTableName);
                varDictGr.setValue(PDConstants.FIELDS.MODEL, processId);
                varDictGr.setValue(PDConstants.FIELDS.MODEL_ID, processId);
                varDictGr.setValue(PDConstants.FIELDS.ELEMENT, variable.variableName);
                this._setCommonVarDictionaryFields(varDictGr, variable);
                varDictGr.insert();
            } else {
                // Update existing records
                if (varDictGr.canWrite()) {
                    this._setCommonVarDictionaryFields(varDictGr, variable);
                    varDictGr.update();
                } else {
                    gs.error(gs.getMessage('Error updating process variable {0} - insufficient privileges', varDictGr.element));
                }
            }
        });

        varDictGr.initialize();
        varDictGr.addQuery(PDConstants.FIELDS.MODEL, processId);
        varDictGr.query();

        while (varDictGr.next()) {
            // Delete obsolete records
            if (!variables.some(variable => this.getVariableName(varDictGr, variable) === varDictGr.getValue(PDConstants.FIELDS.ELEMENT))) {
                varDictGr.deleteRecord();
            }
        }
    },
    createVariableRecord: function(table, id, variable) {
        const varGR = new GlideRecord(table);
        const varTable = this._getVariableTableName(table, id);

        varGR.initialize();
        varGR.setValue(PDConstants.FIELDS.NAME, varTable);
        varGR.setValue(PDConstants.FIELDS.MODEL, id);
        varGR.setValue(PDConstants.FIELDS.MODEL_ID, id);
        varGR.setValue(PDConstants.FIELDS.ELEMENT, variable.variableName);
        varGR.setValue(PDConstants.FIELDS.INTERNAL_TYPE, variable.internalType);
        varGR.setValue(PDConstants.FIELDS.LABEL, variable.label);
        varGR.setValue(PDConstants.FIELDS.COLUMN_LABEL, variable.label);
        varGR.setValue(PDConstants.FIELDS.MANDATORY, variable.mandatory);
        varGR.setValue(PDConstants.FIELDS.HINT, variable.hint);
        varGR.setValue(PDConstants.FIELDS.REFERENCE, variable.reference);
        varGR.setValue(PDConstants.FIELDS.REFERENCE_QUALIFIER_CONDITION, variable.referenceQualifier);
        varGR.setValue(PDConstants.FIELDS.MAX_LENGTH, variable.maxLength);
        varGR.setValue(PDConstants.FIELDS.ORDER, variable.order);
        varGR.insert();

        return varGR;
    },
    getVariableName: function(varDictGr, variable) {
        // if original variableName exceeds the element field max_length then it was trimmed on insert
        var fieldMaxLength = varDictGr.getElement(PDConstants.FIELDS.ELEMENT).getED().getLength();
        var variableName = variable.variableName;
        return variableName.slice(0, fieldMaxLength);
    }
};

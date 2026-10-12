var GeneratorService = Class.create();
GeneratorService.prototype = {
    tableName: "sn_nb_action_resource_generator",

    initialize: function(grOrSysId) {
        this.inputPillParser = new sn_nb_action.NBAActionInputPillParser();
        this.nextBestActionDAO = sn_nb_action.NextBestActionUtil.getNextBestActionDAO();

        if (grOrSysId && grOrSysId.sys_class_name == this.tableName) {
            this.currentRecord = grOrSysId;
        } else if (grOrSysId) {
            var gr = new GlideRecord(this.tableName);
            if (gr.get(grOrSysId)) {
                this.currentRecord = gr;
            }
        }
    },

    hasValidRecord: function() {
        return this.currentRecord && this.currentRecord.sys_class_name == this.tableName;
    },

    getName: function() {
        return this.currentRecord.getValue(Constants.COL_NAME);
    },

    getGeneratorTypeSysId: function() {
        return this.currentRecord.getValue(Constants.COL_GENERATOR_TYPE);
    },

    getRuleContextSysId: function() {
        return this.currentRecord.getValue([Constants.COL_CONTEXT]);
    },

    getGeneratorType: function() {
        return new GeneratorTypeService(this.getGeneratorTypeSysId());
    },

    getGeneratorRecordSysId: function() {
        return this.currentRecord[Constants.COL_GENERATOR];
    },

    getGeneratorRecord: function() {
        var generatorRecord = this.getGeneratorRecordSysId();
        return generatorRecord && generatorRecord.getRefRecord();
    },

    getTypeInputs: function(parsed, contextRecord) {
        var inputs = {};
        var outputsObj = {};
        var inputGlideVar = this.currentRecord[Constants.COL_GENERATOR_INPUT_VARS];
        if (parsed) {
            var ruleContextId = this.getRuleContextSysId();
            outputsObj.contextInputs = this.nextBestActionDAO.getContextInputsObject(contextRecord, ruleContextId);
        }
        for (var inputName in inputGlideVar) {
            if (inputName != "sys_meta" && inputName != "sys_id") {
                var inputVal = inputGlideVar[inputName];
                var descriptor = inputVal.getED();
                if (!gs.nil(inputVal.sys_id)) {
                    inputs[inputName] = inputVal.getRefRecord();
                } else if (descriptor.getInternalType() == 'glide_list') {
                    inputs[inputName] = inputVal;
                } else {
                    inputs[inputName] = inputVal.getDisplayValue();
                    if (parsed) {
                        inputs[inputName] = this.inputPillParser.getParsedInputValue(inputs[inputName], outputsObj, contextRecord);
                    }
                }
            }
        }
        return inputs;
    },

    isValid: function() {
        var param = {};
        param[Constants.evaluatorVariable.RESOURCE_GENERATOR_RECORD] = this.currentRecord;

        var generatorTypeSysId = this.getGeneratorTypeSysId();
        var handler = NextBestActionUtil.getGeneratorTypeHandler(generatorTypeSysId);
        if (handler && typeof handler.isValid === "function") {
            try {
                var res = handler.isValid(param);
            } catch (e) {
                var errorMessage = e.message;
                var logger = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, this.type);
                logger.error('Error executing isValid. Error: ' + errorMessage);
                return {
                    'status': Constants.STATUS_ERROR,
                    'errorCode': 40001,
                    'errorMessage': "Failure occurred while calling isValid"
                };
            }
        }
        return res;
    },

    getGeneratorOutputSchema: function(inputs) {
        var param = {};
        param[Constants.evaluatorVariable.INPUTS] = inputs || this.getTypeInputs();
        param[Constants.evaluatorVariable.GENERATOR_RECORD] = this.getGeneratorRecord();
        param[Constants.evaluatorVariable.RESOURCE_GENERATOR_RECORD] = this.currentRecord;

        var generatorTypeSysId = this.getGeneratorTypeSysId();
        var handler = NextBestActionUtil.getGeneratorTypeHandler(generatorTypeSysId);
        if (handler && typeof handler.getOutputSchema === "function") {
            try {
                var res = handler.getOutputSchema(param);
            } catch (e) {
                var errorMessage = e.message;
                var logger = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, this.type);
                logger.error('Error executing getOutputSchema. Error: ' + errorMessage);
                return {
                    'status': Constants.STATUS_ERROR,
                    'errorCode': 40001,
                    'errorMessage': "Failure occurred while calling getOutputSchema"
                };
            }
        }

        return res;
    },

    getGeneratorOutput: function(contextRecord) {
        var generatorType = this.getGeneratorType();
        var inputs = this.getTypeInputs(true, contextRecord);

        var outputSchema = this.getGeneratorOutputSchema(inputs);
        if (outputSchema && outputSchema.status == Constants.STATUS_SUCCESS) {
            var metaData = outputSchema.metaData;
            var confidenceFieldName = metaData && metaData[Constants.evaluatorVariable.CONFIDENCE];

            var param = {};
            param[Constants.evaluatorVariable.INPUTS] = inputs;
            param[Constants.evaluatorVariable.CONTEXT_RECORD] = contextRecord;
            param[Constants.evaluatorVariable.GENERATOR_RECORD] = this.getGeneratorRecord();
            param[Constants.evaluatorVariable.RESOURCE_GENERATOR_RECORD] = this.currentRecord;

            var generatorTypeSysId = this.getGeneratorTypeSysId();
            var handler = NextBestActionUtil.getGeneratorTypeHandler(generatorTypeSysId);
            if (handler && typeof handler.getOutputs === "function") {
                try {
                    var output = handler.getOutputs(param);
                } catch (e) {
                    var errorMessage = e.message;
                    var logger = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, this.type);
                    logger.error('Error occurred while generating the outputs of resource generator' + '\n' +
                        'Resource Generator: ' + param[Constants.evaluatorVariable.GENERATOR_RECORD].name + '\n' +
                        'Context Record Table: ' + param[Constants.evaluatorVariable.CONTEXT_RECORD].sys_class_name + '\n' +
                        'Context Record SysId: ' + param[Constants.evaluatorVariable.CONTEXT_RECORD].sys_id + '\n' +
                        'Error Message : ' + errorMessage);
                    return {
                        'status': Constants.STATUS_ERROR,
                        'errorCode': 40001,
                        'errorMessage': "Failure occurred while calling getOutputs"
                    };
                }
            }

            if (output && output.status == Constants.STATUS_SUCCESS && output.outputs) {
                var generatorOutputs = output.outputs;
                var validGeneratorOutputs = [];
                var schema = outputSchema.schema || [];
                for (var idx1 = 0; idx1 < generatorOutputs.length; idx1++) {
                    var generatorOutput = generatorOutputs[idx1];
                    var confidenceScore = generatorOutput[confidenceFieldName] || 100;
                    generatorOutput[Constants.evaluatorVariable.CONFIDENCE_INTERNAL] = confidenceScore;

                    var isGeneratorOutputValid = true;
                    for (var idx2 = 0; idx2 < schema.length; idx2++) {
                        var schemaElement = schema[idx2];
                        var schemaElementName = schemaElement.name;
                        var value = generatorOutput[schemaElementName];
                        if (value == null) {
                            isGeneratorOutputValid = false;
                            break;
                        } else if (schemaElement.type == Constants.pillPickerVars.REFERENCE && value != '') {
                            var table = schemaElement.referenceTable;
                            if (table) {
                                //Check if the record is accessible to logged-in user. Skip ACLs check if the schema element is hidden.
                                var gr = new GlideRecord(table);
                                if (value instanceof GlideRecord) {
                                    if (!value.isValidRecord() || !value.canRead()) {
                                        isGeneratorOutputValid = false;
                                        break;
                                    }
                                } else if (gr.get(value) && gr.canRead()) {
                                    generatorOutput[schemaElementName] = gr;
                                } else {
                                    isGeneratorOutputValid = false;
                                    break;
                                }
                            }
                        }
                    }
                    if (isGeneratorOutputValid) {
                        validGeneratorOutputs.push(generatorOutput);
                    }
                }
                output.outputs = validGeneratorOutputs;
            }
            return output;
        }
    },

    type: 'GeneratorService'
};

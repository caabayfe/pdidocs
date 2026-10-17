var DecisionTableGeneratorTypeHandler = Class.create();
DecisionTableGeneratorTypeHandler.prototype = Object.extendsObject(GeneratorTypeHandlerBase, {

    getId: function() {
        return Constants.GENERATOR_TYPE_SYS_ID.DECISION_TABLE;
    },

    getOutputSchema: function(param) {
        var decisionTableGr = param.generatorRecord;
        if (!decisionTableGr || !decisionTableGr.isValidRecord) {
            var errorDetails = new RAExceptionManager('INVALID_DECISION_TABLE');
            var logger = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, 'DecisionTableGeneratorTypeHandler');
            logger.error('Decision table is invalid');
            return {
                'status': Constants.STATUS_ERROR,
                'errorCode': errorDetails.getCode(),
                'errorMessage': errorDetails.getMessage()
            };
        }
        var decisionTableId = decisionTableGr.getValue(Constants.COL_SYS_ID);
        try {
            var dtApi = new sn_dt.DecisionTableAPI();
            var dtMetaData = dtApi.getDecisionTable(decisionTableId);
            var multipleAnswerSupported = dtMetaData.multipleAnswerSupported;
            var schema = [];
            var metaData = {};
            if (multipleAnswerSupported) {
                var answerElements = dtMetaData.answerElements;
                for (var elemIdx = 0; elemIdx < answerElements.length; elemIdx++) {
                    var answerElement = answerElements[elemIdx];
                    if (Constants.TYPE_REFERENCE == answerElement.type) {
                        NextBestActionUtil.addToSchema(schema,
                            answerElement.name,
                            answerElement.label,
                            Constants.TYPE_REFERENCE,
                            answerElement.reference);
                    } else {
                        NextBestActionUtil.addToSchema(schema,
                            answerElement.name,
                            answerElement.label,
                            Constants.TYPE_STRING);
                    }
                }
            } else {
                var answerTable = dtMetaData.answerTable;
                NextBestActionUtil.addToSchema(schema,
                    answerTable.value,
                    answerTable.displayValue,
                    Constants.TYPE_REFERENCE,
                    answerTable.value);
            }
            return {
                'status': Constants.STATUS_SUCCESS,
                'schema': schema,
                'metaData': metaData
            };
        } catch (e) {
            logger = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, 'DecisionTableGeneratorTypeHandler');
            logger.error('Failed to fetch Output schema of Decision table ' + decisionTableId);
            return {
                'status': Constants.STATUS_ERROR,
                'errorCode': '40002',
                'errorMessage': e.message
            };

        }
    },

    getOutputs: function(param) {
        var decisionTableGr = param.generatorRecord;
        if (!decisionTableGr || !decisionTableGr.isValidRecord || !decisionTableGr.active) {
            var errorDetails = new RAExceptionManager('INVALID_OR_INACTIVE_DECISION_TABLE');
            var logger = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, 'DecisionTableGeneratorTypeHandler');
            logger.error('Decision table is invalid or inactive');
            return {
                'status': Constants.STATUS_ERROR,
                'errorCode': errorDetails.getCode(),
                'errorMessage': errorDetails.getMessage()
            };
        }
        var decisionTableId = decisionTableGr.getValue(Constants.COL_SYS_ID);
        try {
            var inputs = param.inputs;

            var dtApi = new sn_dt.DecisionTableAPI();
            //Get Decision table details
            var dtMetaData = dtApi.getDecisionTable(decisionTableId);
            var multipleAnswerSupported = dtMetaData.multipleAnswerSupported;
            var dtGetDecisionsApiInputs = {};
            Object.keys(inputs)
                .forEach(function(key) {
                    if (!(Constants.SYS_META == key || Constants.COL_SYS_ID == key)) {
                        dtGetDecisionsApiInputs[key] = inputs[key];
                    }
                });
            //Evaluate Decision table based on provided inputs
            var dtEvaluationResults = dtApi.getDecisions(decisionTableId, dtGetDecisionsApiInputs);
            var outputs = [];
            for (var resIdx = 0; Array.isArray(dtEvaluationResults) && resIdx < dtEvaluationResults.length; resIdx++) {
                var result = dtEvaluationResults[resIdx];
                var output = {};
                if (multipleAnswerSupported) {
                    var resultElements = result.result_elements;
                    Object.keys(resultElements)
                        .forEach(function(key) {
                            if (!(Constants.SYS_META == key || Constants.COL_SYS_ID == key)) {
                                output[key] = resultElements[key].toString();
                            }
                        });
                } else {
                    var answerName = dtMetaData.answerTable.value;
                    var answerRecord = result.getValue(Constants.COL_SYS_ID);
                    output[answerName] = answerRecord;
                }
                outputs.push(output);
            }
            return {
                'status': Constants.STATUS_SUCCESS,
                'outputs': outputs
            };
        } catch (e) {
            logger = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, 'DecisionTableGeneratorTypeHandler');
            logger.error('Failed to evaluate Decision table ' + decisionTableId);
            return {
                'status': Constants.STATUS_ERROR,
                'errorCode': '40002',
                'errorMessage': e.message
            };
        }
    },

    type: 'DecisionTableGeneratorTypeHandler'
});

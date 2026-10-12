var NLUBatchTestExportUtil = Class.create();

(function() {

    var tables = NLUWorkbenchConstants.tables;
    var table = tables.NLU_BATCH_TEST_RESULT;
    var execTable = tables.NLU_BATCH_TEST_RUN_EXECUTION;
    var exportUtil = sn_nlu_workbench.NLUWorkbenchExportUtil;

    var modelIdToNameCache = {};
    var splitFieldSeperator = ',';

    NLUBatchTestExportUtil.getPredictedData = function(gr, type) {
        var result;
        var predictions = gr.predictions;
        var expIntents = NLUBatchTestExportUtil._getAllExpetedIntents(gr, true);
        if (predictions) {
            try {
                var predictionJson = JSON.parse(predictions);
                predictionJson.forEach(function(eachPrediction) {
                    if (type === 'predicted_intent') {
                        var intent = eachPrediction.intentName;
                        result = result ? (result + ', ' + intent) : intent;
                    } else if (type === 'confidence') {
                        var confidence = NLUCoreUtils.getPercentage(eachPrediction.score, 0) + '%';
                        result = result ? (result + ', ' + confidence) : confidence;
                    } else if (type === 'correct_incorrect') {
                        var predIntent = eachPrediction.intentName ? eachPrediction.intentName.toLowerCase().trim() : '';
                        var outcome = expIntents.indexOf(predIntent) !== -1 ? 'Correct' : 'Incorrect';
                        result = result ? (result + ', ' + outcome) : outcome;
                    } else if (type === 'prediction_model') {
                        var modelDisplayName;
                        if (modelIdToNameCache.hasOwnProperty(eachPrediction.modelId))
                            modelDisplayName = modelIdToNameCache[eachPrediction.modelId];
                        else {
                            var modelGr = global.NLUModel.getGRById(eachPrediction.modelId);
                            if (modelGr) {
                                modelDisplayName = modelGr.display_name;
                                modelIdToNameCache[eachPrediction.modelId] = modelDisplayName;
                            }
                        }
                        if (modelDisplayName)
                            result = result ? (result + ', ' + modelDisplayName) : modelDisplayName;
                    }
                });
            } catch (ex) {
                gs.error('Error while getting predicted ' + type + ' - ' + gr.getUniqueValue() + '[' + ex.message + ']');
            }
        }
        return result || '--';
    };

    NLUBatchTestExportUtil.getExpectedIntent = function(gr, field) {
        var i = field.substr('expected_intent_'.length);
        var expIntents = NLUBatchTestExportUtil._getAllExpetedIntents(gr);
        return (i <= expIntents.length) ? expIntents[i - 1] : '--';
    };

    NLUBatchTestExportUtil._getAllExpetedIntents = function(gr, lowerCase) {
        if (gr.expected_intent) {
            var intentsStr = gr.expected_intent.toString().trim();
            return intentsStr.split(',').map(function(intent) {
                return lowerCase ? intent.trim().toLowerCase() : intent.trim();
            });
        }
        return [];
    };

    NLUBatchTestExportUtil.prototype = {

        initialize: function(jobId) {
            this.jobId = jobId;
        },

        writeToStream: function(executionId, filters, writeStream, fileName) {
            this.prepare(executionId, fileName, true);
            exportUtil.streamFromTable(table, this.addExecIdFilter(filters, executionId), this.fieldDef, writeStream);
        },

        exportResults: function(executionId, filters, fileName) {
            this.prepare(executionId, fileName);
            this.jobId = exportUtil.exportInBackground(table, this.addExecIdFilter(filters, executionId), this.fieldDef, execTable, executionId, this.fileName);
            return this.jobId;
        },

        addExecIdFilter: function(filters, executionId) {
            var execIdFilter = 'test_run_execution=' + executionId;
            if (filters) {
                return filters + '^' + execIdFilter;
            }
            return execIdFilter;
        },

        prepare: function(executionId, fileName, sync) {
            this.fileName = fileName;
            this.fieldDef = {
                utterance: {
                    label: gs.getMessage('Utterance')
                },
                outcome: {
                    label: gs.getMessage('Prediction Outcome')
                },
            };

            var i = 1;
            var maxIntentCnt = 1;
            var executionGr = new GlideRecord(tables.NLU_BATCH_TEST_RUN_EXECUTION);
            if (executionGr.get(executionId)) {
                var testSnapshot = JSON.parse(executionGr.test_set_snapshot);
                if (testSnapshot && testSnapshot.max_intents_count) {
                    maxIntentCnt = testSnapshot.max_intents_count;
                } else {
                    maxIntentCnt = new NLUBatchTestSet(executionGr.test_run_definition.test_set).getMaxIntentsCount();
                    testSnapshot.max_intents_count = maxIntentCnt;
                    executionGr.setValue('test_set_snapshot', JSON.stringify(testSnapshot));
                    executionGr.update();
                }
            }

            if (maxIntentCnt === 1) {
                this.fieldDef.expected_intent = {
                    label: gs.getMessage('Expected Intent')
                };
            } else {
                for (i = 1; i <= maxIntentCnt; i++) {
                    this.fieldDef['expected_intent_' + i] = {
                        label: gs.getMessage('Expected Intent-{0}', i.toString())
                    };
                }
            }

            global.NLUHelper.extend(this.fieldDef, {
                predicted_intent: {
                    label: gs.getMessage('Predicted Intent'),
                    splitField: true
                },
                confidence: {
                    label: gs.getMessage('Confidence'),
                    splitField: true
                },
                correct_incorrect: {
                    label: gs.getMessage('Correct/Incorrect'),
                    splitField: true
                },
                prediction_model: {
                    label: gs.getMessage('Predicted Model'),
                    splitField: true
                }
            });

            if (sync) {
                this.fieldDef.utterance.valueCb = function(gr) {
                    return gr.test_utterance;
                };
                if (maxIntentCnt === 1) {
                    this.fieldDef.expected_intent.valueCb = function(gr) {
                        return gr.expected_intent;
                    };
                } else {
                    for (i = 1; i <= maxIntentCnt; i++)
                        this.fieldDef['expected_intent_' + i].valueCb = sn_nlu_workbench.NLUBatchTestExportUtil.getExpectedIntent;
                }
                this.fieldDef.predicted_intent.valueCb = sn_nlu_workbench.NLUBatchTestExportUtil.getPredictedData;
                this.fieldDef.confidence.valueCb = sn_nlu_workbench.NLUBatchTestExportUtil.getPredictedData;
                this.fieldDef.correct_incorrect.valueCb = sn_nlu_workbench.NLUBatchTestExportUtil.getPredictedData;
                this.fieldDef.prediction_model.valueCb = sn_nlu_workbench.NLUBatchTestExportUtil.getPredictedData;
            } else {
                this.fieldDef.utterance.value = 'gr.test_utterance';
                if (maxIntentCnt === 1) {
                    this.fieldDef.expected_intent.value = 'gr.expected_intent';
                } else {
                    for (i = 1; i <= maxIntentCnt; i++)
                        this.fieldDef['expected_intent_' + i].value = 'sn_nlu_workbench.NLUBatchTestExportUtil.getExpectedIntent(gr, field)';
                }
                this.fieldDef.predicted_intent.value = 'sn_nlu_workbench.NLUBatchTestExportUtil.getPredictedData(gr, field)';
                this.fieldDef.confidence.value = 'sn_nlu_workbench.NLUBatchTestExportUtil.getPredictedData(gr, field)';
                this.fieldDef.correct_incorrect.value = 'sn_nlu_workbench.NLUBatchTestExportUtil.getPredictedData(gr, field)';
                this.fieldDef.prediction_model.value = 'sn_nlu_workbench.NLUBatchTestExportUtil.getPredictedData(gr, field)';
            }
        },

        type: 'NLUBatchTestExportUtil'
    };
})();

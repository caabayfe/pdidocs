var NLUBatchTestResults = Class.create();

(function() {
    var coreTables = global.NLUConstants.tables;
    var tables = NLUWorkbenchConstants.tables;
    var FIELDS = {
        TEST_EXECUTION: 'test_run_execution',
        UTTERANCE: 'utterance', // reference to nlu_batch_test_utterance
        PREDICTIONS: 'predictions', // actual json from backend (we add modelId, modelDisplayName)
        TYPE: 'prediction_type',
        OUTCOME: 'outcome',
        TEST_UTTERANCE: 'test_utterance',
        EXPECTED_INTENT: 'expected_intent'
    };
    var EXECUTION_STATUS = NLUWorkbenchConstants.EXECUTION_STATUS;
    var RESULT_TYPE = NLUWorkbenchConstants.BATCHTEST_RESULT_TYPE;

    var OUTCOME = {
        CORRECT: 'correct',
        CORRECT_AMONG_MULTIPLE: 'correct_among_multiple',
        INCORRECT: 'incorrect',
        INCORRECTLY_SKIPPED: 'incorrectly_skipped',
    };

    function getDefaultPerModelOverallData() {
        var defaultData = {
            intents_count: {
                covered: 0,
                total: 0
            }
        };
        defaultData[RESULT_TYPE.CURRENT] = {};
        defaultData[RESULT_TYPE.CURRENT][OUTCOME.CORRECT] = 0;
        defaultData[RESULT_TYPE.CURRENT][OUTCOME.CORRECT_AMONG_MULTIPLE] = 0;
        defaultData[RESULT_TYPE.CURRENT][OUTCOME.INCORRECT] = 0;
        defaultData[RESULT_TYPE.CURRENT][OUTCOME.INCORRECTLY_SKIPPED] = 0;
        return defaultData;
    }

    function getDefaultPerModelData(type) {
        var defaultData = {
            expectedIntents: []
        };
        defaultData[type] = {
            predictedIntents: []
        };
        return defaultData;
    }

    function getOverlap(expectedIntents, predictedIntents) {
        return expectedIntents.filter(function(expIntent) {
            return predictedIntents.filter(function(predIntent) {
                return expIntent.trim().toLowerCase() === predIntent.trim().toLowerCase();
            }).length > 0;
        }).length;
    }

    /*
    Rubric logic: 
    1. predIntents === expeIntents                     --> CORRECT 
    2. predIntents is empty & expeIntents is not empty --> INCORRECTLY_SKIPPED 
    3. predIntents contains all expeIntents            --> CORRECT_AMONG_MULTIPLE
    4. Rest all cases.                                 --> INCORRECT
    */
    function evaluteOutcome(expIntents, predIntents) {
        var predIntentCnt = predIntents ? predIntents.length : 0;
        var expIntentCnt = expIntents ? expIntents.length : 0;

        var outcome = OUTCOME.INCORRECT;
        if (expIntentCnt === 0 && predIntentCnt === 0)
            outcome = OUTCOME.CORRECT;
        else if (predIntentCnt === 0)
            outcome = OUTCOME.INCORRECTLY_SKIPPED;
        else if (expIntentCnt > 0) {
            var commonIntentsCnt = getOverlap(expIntents, predIntents);
            if (commonIntentsCnt === expIntentCnt) { // expeIntents are subset of predIntents 
                if (predIntentCnt === expIntentCnt)
                    outcome = OUTCOME.CORRECT;
                else
                    outcome = OUTCOME.CORRECT_AMONG_MULTIPLE;
            }
            // else cases: 
            // - No common intents (commonIntentsCnt == 0)
            // - Few common intents:
            //     - Predicted are part of expected (commonIntentsCnt == predIntentCnt)
            //     - Few of predicted & few of expected are only common (commonIntentsCnt < predIntentCnt && commonIntentsCnt < expIntentCnt)
        }
        // else cases: 
        // - No expected, but there are predictions (expIntentCnt == 0 && predIntentCnt > 0)

        return outcome;
    }

    function getTestUtteranceFromId(utteranceId) {
        var testUtteranceGr = new GlideRecord(tables.NLU_BATCH_TEST_UTTERANCE);
        testUtteranceGr.get(utteranceId)
        testUtteranceGr.query();
        var result = {};
        if (testUtteranceGr.next()) {
            result['utterance'] = testUtteranceGr.utterance;
            result['intent'] = testUtteranceGr.intent;
        }
        return result;
    }

    NLUBatchTestResults.prototype = {

        initialize: function(testExecution) {
            this.testExecution = testExecution;
            this.executionId = testExecution.getId();
            this.testSetId = testExecution.getTestSet();

            /* 
            - This data goes directly to the execution's model snapshot:
            { 
                <modelName>: {
                    id,
                    intents_count: {covered, total}
                    current: {correct, correct_among_multiple, incorrect, incorrectly_skipped, confidence_threshold}
                    recommended: ... 
                    optimized: ... 
                },
                ...
            }
            */
            this.modelDataMap = {};

            // Map of intentName to modelName (cache to avoid glide call)
            this.expectedIntentToModelMap = {};

            // Max expected intents per utterance provideded in the test set.
            this.maxExpectedIntents = 1;
        },

        initDataMap: function() {
            var context = this;
            this.modelIds = [];
            var modelSnapshot = JSON.parse(this.testExecution.getGR().getValue('models_data'));
            modelSnapshot && modelSnapshot.forEach(function(snapshot) {
                context.modelIds.push(snapshot.id);
                context.addConfidenceThreshold(snapshot.name, RESULT_TYPE.CURRENT, snapshot.confidence_threshold);
                context.modelDataMap[snapshot.name].id = snapshot.id;
            });
        },

        updateSnapshot: function(applyThreshold) {
            var context = this;
            var modelSnapshot = JSON.parse(this.testExecution.getGR().getValue('models_data'));
            modelSnapshot = modelSnapshot.map(function(snapshot) {
                context.updateIntentsCovered(snapshot);
                return global.NLUHelper.extend(snapshot, context.modelDataMap[snapshot.name]);
            });
            this.testExecution.getGR().setValue('models_data', JSON.stringify(modelSnapshot));

            var testSetSnapshot = JSON.parse(this.testExecution.getGR().getValue('test_set_snapshot'));
            testSetSnapshot.max_intents_count = this.maxExpectedIntents;
            this.testExecution.getGR().setValue('test_set_snapshot', JSON.stringify(testSetSnapshot));

            if (applyThreshold) {
                var testExecutionGr = this.testExecution.getGR();
                /**
                 * condition 1: #models is 1
                 * condition 2: test set is default test set and threshold type is "automatic"
                 * condition 3: recommended threshold exists
                 */
                if (modelSnapshot.length === 1) {
                    var model = modelSnapshot[0];
                    var modelGr = global.NLUModel.getGRById(model.id);
                    if (testExecutionGr.test_run_definition.test_set.model == model.id && modelGr.getValue('threshold_type') == 'automatic' && model.recommended && model.recommended.confidence_threshold) {
                        this.testExecution.applyRecommendation();
                        new global.NLUModel(model.id).syncStatus();
                    }
                }
            }

            this.testExecution.updateStatus(EXECUTION_STATUS.SUCCESS);
            return modelSnapshot;
        },

        updateIntentsCovered: function(snapshot) {
            var context = this;
            var modelId = snapshot.id;
            var modelName = snapshot.name;

            // Total intents in the selected model:
            var totalIntents = parseInt(NLUCoreUtils.getIntentCount('model=' + modelId));

            var intentsCovered = Object.keys(this.expectedIntentToModelMap).filter(function(intentName) {
                return context.expectedIntentToModelMap[intentName] === modelName;
            }).length;

            context.modelDataMap[snapshot.name].intents_count = {
                covered: intentsCovered,
                total: totalIntents
            };
            NLUAdvLUAUtils.recordIntentTestSetCoverage(Math.round((intentsCovered / totalIntents) * 100));
        },

        addConfidenceThreshold: function(modelName, type, ct) {
            if (!this.modelDataMap.hasOwnProperty(modelName))
                this.modelDataMap[modelName] = getDefaultPerModelOverallData();

            if (!this.modelDataMap[modelName].hasOwnProperty(type))
                this.modelDataMap[modelName][type] = getDefaultPerModelOverallData()[RESULT_TYPE.CURRENT];

            this.modelDataMap[modelName][type].confidence_threshold = ct;
        },

        getConfidenceThreshold: function(modelName, type) {
            return this.modelDataMap[modelName] &&
                this.modelDataMap[modelName][type] &&
                this.modelDataMap[modelName][type].confidence_threshold;
        },

        addOutcomeToMap: function(modelName, type, outcome) {
            if (!this.modelDataMap.hasOwnProperty(modelName))
                this.modelDataMap[modelName] = getDefaultPerModelOverallData();

            if (!this.modelDataMap[modelName].hasOwnProperty(type))
                this.modelDataMap[modelName][type] = getDefaultPerModelOverallData()[RESULT_TYPE.CURRENT];

            var outcomeCnt = this.modelDataMap[modelName][type][outcome];
            this.modelDataMap[modelName][type][outcome] = (outcomeCnt || 0) + 1;
        },

        /*
        prediction: {
            utterance,
            intents: [
                {
                    intentName,
                    nluModelName,
                    score
                },
                ..
            ]
        }
        */
        addResult: function(predictionData, type, testResultGr) {
            var testUtteranceGr = this._getTestUtterance(predictionData.utterance);
            if (testUtteranceGr) {
                var expectedIntents = testUtteranceGr.intent ? testUtteranceGr.intent.trim().split(',').filter(function(intent) {
                    // removing empty spaces
                    return !!intent;
                }).map(function(intent) {
                    return intent.trim().toLowerCase();
                }) : [];
                if (expectedIntents.length > this.maxExpectedIntents)
                    this.maxExpectedIntents = expectedIntents.length;

                // Filter the predictioins based on model threshold 
                var predictionAboveThreshold = this.filterPredictions(predictionData.intents, type);

                // from expected intents, populate intent -> modelName map (used for intentCounts)
                var resp = this.processExpectedAndPredictedIntents(type, expectedIntents, predictionAboveThreshold);

                // Uses the modelToIntentsMap data to evaluate model level outcome and updates the same map: 
                this.updateModelLevelOutcome(type, resp.modelToIntentsMap);

                if (testResultGr) {
                    testResultGr.setValue(FIELDS.OUTCOME, resp.overallOutcome);
                    testResultGr.setValue(FIELDS.PREDICTIONS, JSON.stringify(predictionAboveThreshold));
                    return testResultGr.update();
                } else {
                    return this._addNewRecord(testUtteranceGr.getUniqueValue(), type, resp.overallOutcome, predictionAboveThreshold);
                }
            }
        },

        // - Filters the predictions above threshold 
        // - Adds modelId to the predictionInfo. (this goes to the result record)
        // - Updates modelToIntentsMap data. (used in calculating model level outcome)
        filterPredictions: function(predictions, type) {
            var context = this;
            return predictions.filter(function(predictionInfo) {
                if (!predictionInfo.nluModelName) return false;

                var modelName = predictionInfo.nluModelName;
                var modelCt = context.getConfidenceThreshold(modelName, type);
                modelCt = modelCt ? parseFloat(modelCt) : 1;
                var predictedCt = predictionInfo.score;
                if (predictedCt >= modelCt) {
                    // Update modelId to the predictionInfo
                    if (context.modelDataMap[modelName] && context.modelDataMap[modelName].id) {
                        predictionInfo.modelId = context.modelDataMap[modelName].id;
                    } else {
                        var modelGr = global.NLUModel.getGRByName(modelName);
                        if (modelGr) {
                            var modelId = modelGr.getUniqueValue();
                            predictionInfo.modelId = modelId;
                        }
                    }
                    return true;
                }
                return false;
            });
        },

        /*
            - This data is used to evaluate the outcome at each prediction
            { 
                <modelName>: {
                    expectedIntents: [],
                    current: { predictedIntents: [] },
                    recommended: ...
                    optimized: ...
                },
                ...
            }
		*/
        processExpectedAndPredictedIntents: function(type, expectedIntents, predictionInfo) {
            var context = this;
            var modelToIntentsMap = {};

            expectedIntents.forEach(function(intentName) {
                var modelName = context.expectedIntentToModelMap[intentName];
                if (!modelName) {
                    // Evaluating model name for intent name and added to the map
                    var intentGr = NLUCoreUtils.getIntentGrByName(intentName, 'modelIN' + context.modelIds.join(','));
                    modelName = intentGr.next() && (intentGr.model.name + '');
                    if (modelName)
                        context.expectedIntentToModelMap[intentName] = modelName;
                }
                if (modelName) {
                    if (!modelToIntentsMap.hasOwnProperty(modelName))
                        modelToIntentsMap[modelName] = getDefaultPerModelData(type);

                    if (modelToIntentsMap[modelName].expectedIntents.indexOf(intentName) === -1)
                        modelToIntentsMap[modelName].expectedIntents.push(intentName);
                }
            });

            var predictedIntents = [];
            predictionInfo.forEach(function(predictionInfo) {
                var intentName = predictionInfo.intentName ? predictionInfo.intentName.trim().toLowerCase() : '';
                predictedIntents.push(intentName);
                var modelName = predictionInfo.nluModelName || '';
                if (!modelToIntentsMap.hasOwnProperty(modelName))
                    modelToIntentsMap[modelName] = getDefaultPerModelData(type);

                if (modelToIntentsMap[modelName][type].predictedIntents.indexOf(intentName) === -1)
                    modelToIntentsMap[modelName][type].predictedIntents.push(intentName);
            });

            return {
                modelToIntentsMap: modelToIntentsMap,
                overallOutcome: evaluteOutcome(expectedIntents, predictedIntents)
            };
        },

        updateModelLevelOutcome: function(type, modelToIntentsMap) {
            var context = this;

            // Comparing the expected and predicted outcomes corresponding to each model in modelPerformance
            // and returning mismatch count. Updating modelPrediction with correct, incorrect, incorrectly_skipped
            Object.keys(modelToIntentsMap).forEach(function(modelName) {
                var modelInfo = modelToIntentsMap[modelName];
                var modelExpIntents = modelInfo.expectedIntents;
                var modelPredIntents = modelInfo[type].predictedIntents;

                var modelOutcome = evaluteOutcome(modelExpIntents, modelPredIntents);
                context.addOutcomeToMap(modelName, type, modelOutcome);
            });
        },

        _addNewRecord: function(testUtteranceId, type, outcome, predictions) {
            var testResultGr = new GlideRecord(tables.NLU_BATCH_TEST_RESULT);
            testResultGr.initialize();
            testResultGr.setValue(FIELDS.TEST_EXECUTION, this.executionId);
            testResultGr.setValue(FIELDS.UTTERANCE, testUtteranceId);
            var testUtterance = getTestUtteranceFromId(testUtteranceId);
            testResultGr.setValue(FIELDS.TEST_UTTERANCE, testUtterance['utterance']);
            testResultGr.setValue(FIELDS.EXPECTED_INTENT, testUtterance['intent']);
            testResultGr.setValue(FIELDS.TYPE, type);
            testResultGr.setValue(FIELDS.OUTCOME, outcome);
            testResultGr.setValue(FIELDS.PREDICTIONS, JSON.stringify(predictions));
            return testResultGr.insert();
        },

        _getTestUtterance: function(utteranceTxt) {
            var testUtteranceGr = new GlideRecord(tables.NLU_BATCH_TEST_UTTERANCE);
            testUtteranceGr.addQuery('test_set', this.testSetId);
            testUtteranceGr.addQuery('utterance', utteranceTxt);
            testUtteranceGr.query();
            return testUtteranceGr.next() && testUtteranceGr;
        },

        type: 'NLUBatchTestResults'
    };
})();

var NLUBatchTestExecution = Class.create();

(function() {

    var tables = NLUWorkbenchConstants.tables;
    var EXECUTION_STATUS = NLUWorkbenchConstants.EXECUTION_STATUS;
    var FIELDS = {
        DEFINTION: 'test_run_definition',
        SOLUTION: 'solution',
        MODELS_DATA: 'models_data',
        TEST_SET_SNAPSHOT: 'test_set_snapshot',
        STATUS: 'status',
        SELECTED_TYPE: 'selected_type',
        HIDE_RECOMMENDATION: 'hide_recommendation',
        SYS_CREATED_ON: 'sys_created_on'
    };
    var RESULT_TYPE = NLUWorkbenchConstants.BATCHTEST_RESULT_TYPE;
    var trainingMode = NLUWorkbenchConstants.TRAINING_MODE;
    var sysProps = NLUWorkbenchConstants.sysProps;
    var constants = NLUWorkbenchConstants.constants;
    var REVIEWED_QUERY =
        'ignored=false^utterance_1.utteranceSAMEASoriginal_utterance_1^utterance_2.utteranceSAMEASoriginal_utterance_2';
    var inProgressStates = [EXECUTION_STATUS.PREPARING, EXECUTION_STATUS.INPROGRESS, EXECUTION_STATUS.PROCESSING_RESULTS];

    var getNotificationMessage = function(issue, breakdown) {
        var message;
        switch (issue.dimension) {
            case 'minIntentCoverage':
                if (issue.type === 'ERROR') {
                    message = gs.getMessage('An optimized model could not be generated as the percentage of intents covered ({0}%) in the test set was too low. Please add more utterances to increase coverage in the test set (recommended: {1}%, minimum: {2}%) before you rerun this analysis.', [NLUCoreUtils.getPercentage(breakdown.current), NLUCoreUtils.getPercentage(breakdown.expectedWarning), NLUCoreUtils.getPercentage(breakdown.expectedError)]);
                } else {
                    message = gs.getMessage('The test set used for this analysis has ({0}%) intents covered. Consider adding more utterances to increase the intent coverage in test set (recommended: {1}%) to get a better optimized model.', [NLUCoreUtils.getPercentage(breakdown.current), NLUCoreUtils.getPercentage(breakdown.expectedWarning)]);
                }
                break;
            case 'minUtteranceCount':
                if (issue.type === 'ERROR') {
                    message = gs.getMessage('An optimized model could not be generated as the number of utterances {0} in the test set was too low. There should be a minimum of {1} utterances before you rerun this analysis.', [breakdown.current, breakdown.expectedError]);
                }
                break;
            case 'minNoIntentCoverage':
                if (issue.type === 'WARNING') {
                    message = gs.getMessage('The test set used for this analysis has very low percentage of utterances ({0}%) which have no expected intent (Irrelevant utterances). Consider adding such utterances to the test set to get a better optimized model.', NLUCoreUtils.getPercentage(breakdown.current));
                }
                break;
            default:
                break;
        }
        return message;
    };

    var isLatestExecution = function(modelId, executionGr, trainedVersion) {
        var modelStatus = global.NLUStudioService.getModelStatus(modelId);
        var lastTrainedTimestamp = !gs.nil(modelStatus) && !gs.nil(modelStatus.lastTrainedOn) ?
            new GlideDateTime(modelStatus.lastTrainedOn).getValue() : null;
        var modelData = JSON.parse(executionGr.getValue(FIELDS.MODELS_DATA) || '[]');
        if (modelData.length === 0) return false;
        var testTrainedVersion = modelData[0] && modelData[0].trained_version;
        return parseInt(testTrainedVersion) === parseInt(trainedVersion) && executionGr.getValue('sys_created_on') >= lastTrainedTimestamp;
    };

    var getLatestExecution = function(modelId, optimize, trainedVersion, inProgress) {
        var gr = new GlideRecord(tables.NLU_BATCH_TEST_RUN_EXECUTION);
        gr.addQuery('test_run_definition.models', modelId);
        if (inProgress)
            gr.addQuery('status', 'IN', inProgressStates.join() + ',success');
        else
            gr.addQuery('status', 'success');
        gr.addQuery('test_run_definition.optimize', optimize || false);
        gr.orderByDesc('sys_created_on');
        gr.query();
        while (gr.next()) {
            var models = gr.test_run_definition.models.toString();
            if (models === modelId && (trainedVersion ? isLatestExecution(modelId, gr, trainedVersion) : true))
                return gr;
        }
        return null;
    };

    var getIsHideOptimization = function(data) {
        var current = data.currentCorrect + data.currentCorrectAmongMultiple + data.currentIncorrect + data.currentSkipped;
        var optimized = data.recommendedCorrect + data.recommendedCorrectAmongMultiple + data.recommendedIncorrect + data.recommendedSkipped;
        var overallCorrectImprovementPercent =
            ((data.recommendedCorrect + data.recommendedCorrectAmongMultiple) / optimized) - ((data.currentCorrect + data.currentCorrectAmongMultiple) / current);
        var incorrectImprovementPercent =
            (data.currentIncorrect / current) - (data.recommendedIncorrect / optimized);
        return (
            100 * overallCorrectImprovementPercent <= -2 ||
            100 * (overallCorrectImprovementPercent + incorrectImprovementPercent) <= 1
        );
    };

    var hasOptimizeData = function(data) {
        var optimized = data.recommendedCorrect + data.recommendedCorrectAmongMultiple + data.recommendedIncorrect + data.recommendedSkipped;
        return optimized > 0;
    };

    NLUBatchTestExecution.addRecord = function(definitionId, modelSnapshot, testSetSnapshot) {
        var executionGr = new GlideRecord(tables.NLU_BATCH_TEST_RUN_EXECUTION);
        executionGr.initialize();
        executionGr.setValue(FIELDS.DEFINTION, definitionId);
        executionGr.setValue(FIELDS.MODELS_DATA, JSON.stringify(modelSnapshot));
        executionGr.setValue(FIELDS.TEST_SET_SNAPSHOT, JSON.stringify(testSetSnapshot));
        return executionGr.insert();
    };

    NLUBatchTestExecution.getReportInfo = function(modelId, isOptimize, trainedVersion, lastOptimizeApplied) {
        var executionGr = new GlideRecord(tables.NLU_BATCH_TEST_RUN_EXECUTION);
        executionGr.addEncodedQuery('test_run_definition.test_set.model=' + modelId);
        executionGr.addQuery('status', 'IN', inProgressStates.join() + ',success');
        executionGr.addQuery('test_run_definition.optimize', isOptimize || false);
        executionGr.orderByDesc('sys_created_on');
        executionGr.query();
        if (!executionGr.next()) return {};
        if (!(trainedVersion ? isLatestExecution(modelId, executionGr, trainedVersion) : true))
            return {};
        var result = {
            executionId: executionGr.getUniqueValue(),
            definitionId: executionGr.getValue(FIELDS.DEFINTION),
            status: executionGr.getValue(FIELDS.STATUS)
        };
        if (inProgressStates.indexOf(result.status) !== -1) {
            result.status = 'inprogress';
        }
        result.hasCompletedReport = false;
        if (result.status === 'success') {
            result.hasCompletedReport = true;
            if (lastOptimizeApplied) {
                result.lastTrainedVersionOptimizedOn = executionGr.getValue('sys_created_on');
            }
        } else {
            while (executionGr.next()) {
                if (executionGr.getValue(FIELDS.STATUS) === 'success' &&
                    executionGr.getValue(FIELDS.DEFINTION) === result.definitionId) {
                    result.hasCompletedReport = true;
                    if (lastOptimizeApplied) {
                        result.lastTrainedVersionOptimizedOn = executionGr.getValue('sys_created_on');
                    }
                    break;
                }
            }
        }
        return result;
    };

    NLUBatchTestExecution.getTestRunDataWithLabel = function(modelId) {
        var result = {};
        var modelStatus = global.NLUStudioService.getModelStatus(modelId);
        var trainedVersion = modelStatus.trainedVersion;
        var publishedVersion = modelStatus.publishedVersion;

        var executionGr = getLatestExecution(modelId, true, trainedVersion) || getLatestExecution(modelId, false, trainedVersion);
        if (!executionGr) throw new Error(gs.getMessage('NLU Batch test execution: No record exists for model {0)}', modelId));

        var nluBatchTestExecution = new NLUBatchTestExecution(executionGr.getUniqueValue());
        var isOptimize = nluBatchTestExecution.isOptimize();
        var data = nluBatchTestExecution.getTestRunData();
        var modelData = JSON.parse(executionGr.getValue(FIELDS.MODELS_DATA) || '[]');

        var testTrainedVersion = modelData[0] && modelData[0].trained_version;
        result = {
            executionId: executionGr.getUniqueValue(),
            definitionId: executionGr.getValue(FIELDS.DEFINTION),
            selected_type: executionGr.getValue(FIELDS.SELECTED_TYPE),
            status: executionGr.getValue(FIELDS.STATUS),
            trainedVersion: trainedVersion,
            publishedVersion: publishedVersion,
            testTrainedVersion: testTrainedVersion,
            createdOn: executionGr.getValue(FIELDS.SYS_CREATED_ON),
            current: [{
                    id: 'CORRECT_OUTCOMES',
                    value: data.currentCorrect,
                    title: gs.getMessage('Correct')
                },
                {
                    id: 'CORRECT_AMONG_MULTIPLE_OUTCOMES',
                    value: data.currentCorrectAmongMultiple,
                    title: gs.getMessage('Correct among multiple')
                },
                {
                    id: 'INCORRECTLY_SKIPPED_OUTCOMES',
                    value: data.currentSkipped,
                    title: gs.getMessage('Missed')
                },
                {
                    id: 'INCORRECT_OUTCOMES',
                    value: data.currentIncorrect,
                    title: gs.getMessage('Incorrect')
                }
            ],
            optimized: isOptimize && hasOptimizeData(data) ? [{
                    id: 'CORRECT_OUTCOMES',
                    value: data.recommendedCorrect,
                    title: gs.getMessage('Correct')
                },
                {
                    id: 'CORRECT_AMONG_MULTIPLE_OUTCOMES',
                    value: data.recommendedCorrectAmongMultiple,
                    title: gs.getMessage('Correct among multiple')
                },
                {
                    id: 'INCORRECTLY_SKIPPED_OUTCOMES',
                    value: data.recommendedSkipped,
                    title: gs.getMessage('Missed')
                },
                {
                    id: 'INCORRECT_OUTCOMES',
                    value: data.recommendedIncorrect,
                    title: gs.getMessage('Incorrect')
                }
            ] : [],
            isModelOptimizedEnough: isOptimize ? getIsHideOptimization(data) && (modelData || []).filter(function(modelInfo) {
                return modelInfo.optimized;
            }).length > 0 : false
        };
        return result;
    };

    NLUBatchTestExecution.prototype = {

        initialize: function(executionId, executionGr) {
            this.executionId = executionId;
            if (executionGr) {
                this.gr = executionGr;
                this.executionId = executionGr.getUniqueValue();
            }
        },

        getId: function() {
            return this.executionId;
        },

        getGR: function() {
            if (!gs.nil(this.gr)) return this.gr;
            this.gr = new GlideRecord(tables.NLU_BATCH_TEST_RUN_EXECUTION);
            if (this.gr.get(this.executionId))
                return this.gr;
            else
                throw new Error(gs.getMessage('Invalid batch test execution'));
        },

        start: function() {
            try {
                this.getGR();

                var solutionName = this._addSolution();
                var trainJson = this._getTrainJson();
                var trainResult = NLUBatchTestIntegrator.submitTestRun(solutionName, trainJson);
                if (!trainResult || trainResult.status === 'failure')
                    throw new Error(gs.getMessage('Failed to submit training job'));

                this._updateSolution(trainResult);
                return trainResult;
            } catch (e) {
                this.updateStatus(EXECUTION_STATUS.FAILED);
                return this._errorResult(e.message);
            }
        },

        cancel: function() {
            try {
                this.getGR();

                var status = this.gr.getValue(FIELDS.STATUS);
                if (status === EXECUTION_STATUS.INPROGRESS) {
                    this.updateStatus(EXECUTION_STATUS.CANCELLED);
                    return NLUBatchTestIntegrator.cancelTestRun(this.getSolutionName());
                } else if (status === EXECUTION_STATUS.PREPARING || status === EXECUTION_STATUS.PROCESSING_RESULTS) {
                    global.NLUWorkbenchGlobalScript.cancelSchedule(tables.NLU_BATCH_TEST_RUN_EXECUTION, this.executionId);
                    this._cleanUpTestResults();
                    this.updateStatus(EXECUTION_STATUS.CANCELLED);
                    return {
                        status: 'success',
                        message: gs.getMessage('The test set execution has been cancelled')
                    };
                } else {
                    return this._errorResult(gs.getMessage('Batch test execution is not in progress'));
                }
            } catch (e) {
                this.updateStatus(EXECUTION_STATUS.FAILED);
                return this._errorResult(e.message);
            }
        },

        applyRecommendation: function() {
            try {
                this.getGR();

                // Switch to Recommended
                this.gr.setValue(FIELDS.SELECTED_TYPE, RESULT_TYPE.RECOMMENDED);
                this.gr.setValue(FIELDS.HIDE_RECOMMENDATION, true);
                this.gr.update();

                return this._updateModelThreshold();
            } catch (e) {
                return this._errorResult(e.message);
            }
        },

        getModelOptimizationTotalCount: function(encodedQuery) {
            var gr = new GlideAggregate(tables.NLU_OPTIMIZED_BATCH_TEST_RESULTS);
            gr.addEncodedQuery(encodedQuery, true);
            gr.addAggregate('COUNT');
            gr.query();
            return gr.next() ? parseInt(gr.getAggregate('COUNT')) : 0;
        },

        getModelOptimizationChanges: function(currentOutcome, optimizedOutcome, offset, limit, sortBy, sortOrder) {
            var data = [];
            var encodedQuery = 'btr1_test_run_execution=' + this.executionId + '^btr1_outcomeIN' + currentOutcome.join(',') + '^btr2_outcome=' + optimizedOutcome;
            var count = this.getModelOptimizationTotalCount(encodedQuery);
            if (sortBy && sortOrder) {
                encodedQuery += sortOrder === "ASC" ? '^ORDERBYbtr1_' + sortBy : '^ORDERBY' + sortOrder + 'btr1_' + sortBy;
            }
            var gr = new GlideRecord(tables.NLU_OPTIMIZED_BATCH_TEST_RESULTS);
            gr.addEncodedQuery(encodedQuery);
            gr.chooseWindow(offset, offset + limit);
            gr.query();
            while (gr.next()) {
                data.push({
                    utterance: gr.getDisplayValue('btr1_test_utterance'),
                    expectedIntent: gr.getDisplayValue('btr1_expected_intent'),
                    currentPredictions: gr.getValue('btr1_predictions'),
                    optimizedPredictions: gr.getValue('btr2_predictions')
                });
            }
            return {
                data: data,
                count: count
            };
        },

        acceptAndPublishOptimizedModel: function() {
            var errorMessage;
            try {
                this.getGR();
                var modelsData = this.gr.getValue(FIELDS.MODELS_DATA);
                var modelDataJson = JSON.parse(modelsData || '[]');
                if (modelDataJson.length > 0) {
                    var modelInfo = modelDataJson[0];
                    var toSolutionName = modelInfo && modelInfo.solutionName || '';

                    var fromSolutionName = this.getSolutionName();
                    var fromVersionNumber = this.getSolutionVersion();

                    // Accept optimized model
                    var copyResp = NLUBatchTestIntegrator.copyArtifacts(fromSolutionName, fromVersionNumber, toSolutionName);
                    if (copyResp && copyResp.status !== 'failure') {
                        new global.NLUModel(modelInfo.id).syncStatus(); // to update sys_nlu_model_status table
                        var publishResult = global.NLUStudioPublisher.publishModel(modelInfo.id);
                        if (publishResult && publishResult.status !== 'failure') {
                            this.gr.setValue(FIELDS.HIDE_RECOMMENDATION, true);
                            this.gr.setValue(FIELDS.SELECTED_TYPE, RESULT_TYPE.OPTIMIZED);
                            this.gr.update();
                            return publishResult;
                        } else
                            errorMessage = publishResult.message || gs.getMessage('Failed to apply optimization - unable to publish model');
                    } else
                        errorMessage = copyResp.message || gs.getMessage('Failed to apply optimization - unable to copy artifacts');
                } else
                    errorMessage = gs.getMessage('Failed to apply optimization - model data is empty');
            } catch (e) {
                errorMessage = e.message;
            }
            return this._errorResult(errorMessage);
        },

        getOptimizationNotifications: function() {
            var notifications = [];
            var solutionVersion = NLUBatchTestIntegrator.getTestRunSolution(this.getSolutionName(), this.getSolutionVersion());
            var validationSummary = NLUBatchTestIntegrator.getTestsetValidationData(solutionVersion);
            if (validationSummary.status === 'success') {
                var response = validationSummary.response;
                response.dimensionIssues.forEach(function(issue) {
                    var breakdown = response.dimensionBreakdown[issue.dimension];
                    var message = getNotificationMessage(issue, breakdown);
                    notifications.push({
                        type: issue.type,
                        message: message || issue.message
                    });
                });
            } else {
                throw new Error(validationSummary.message);
            }
            return notifications;
        },

        updateStatus: function(status) {
            if (this.gr) {
                this.gr.setValue(FIELDS.STATUS, status);
                return this.gr.update();
            }
        },

        getSolutionName: function() {
            return !gs.nil(this.getGR()) && this.gr.solution && this.gr.solution.solution_name;
        },

        getSolutionVersion: function() {
            return !gs.nil(this.getGR()) && this.gr.solution && this.gr.solution.version;
        },

        isOptimize: function() {
            var isOptimize = !gs.nil(this.getGR()) && this.gr.test_run_definition && this.gr.test_run_definition.optimize;
            return isOptimize != 0 && !!isOptimize;
        },

        getTestSet: function() {
            return !gs.nil(this.getGR()) && this.gr.test_run_definition && this.gr.test_run_definition.test_set;
        },

        _addSolution: function() {
            var solutionName = this.getSolutionName();
            if (!solutionName || solutionName === '')
                solutionName = NLUBatchTestIntegrator.addSolution(this.executionId, this.isOptimize());
            if (gs.nil(solutionName)) throw new Error(gs.getMessage('Failed to create solution'));
            return solutionName;
        },

        _getTrainJson: function() {
            var modelSnapshot = this.gr.models_data && JSON.parse(this.gr.models_data);

            var modelList = [];
            var modelNames = [];
            modelSnapshot && modelSnapshot.forEach(function(eachModel) {
                modelList.push([{
                    solutionName: eachModel.solutionName || eachModel.name,
                    solutionVersion: eachModel.trained_version,
                    language: eachModel.language
                }]);
                modelNames.push(eachModel.name);
            });

            return {
                solutionInfo: this._getSolutionInfo(JSON.stringify(modelList), modelNames),
                payload: this._getPayload(JSON.stringify(modelNames))
            };
        },

        _getSolutionInfo: function(modelListStr, modelNames) {
            var testSetName = this.gr.test_run_definition.test_set.name.toString();
            var solutionInfo = JSON.parse(JSON.stringify({
                nluTrainingMode: trainingMode.ASYNC_BATCH,
                modelId: modelListStr,
                label: testSetName
            }));
            if (this.isOptimize()) {
                solutionInfo.nluTrainingMode = trainingMode.TRAIN_OPTIMIZE;
                solutionInfo.solutionToOptimize = solutionInfo.modelId;
                var intentIds = NLUCoreUtils.getIntentIdsFromModelName(modelNames[0]);
                var encodedQuery = 'usage=nlu_model_train^product=nlu^label_typeINpositive,irrelavant^label_referenceIN' + intentIds.join(',');
                var ultGr = new GlideRecord(tables.ULT);
                ultGr.addEncodedQuery(encodedQuery);
                ultGr.query();
                if (ultGr.getRowCount() > 0) {
                    solutionInfo.datasetProperties = {
                        "tableName": "ml_labeled_data",
                        "fieldNames": ['text,label,label_type,correct_label,recommendation,source,product,usage,frequency,sys_domain']
                    };
                    solutionInfo.datasetProperties.encodedQuery = encodedQuery.toString();
                }
                delete solutionInfo.modelId;
            }
            return solutionInfo;
        },

        _getUtterances: function() {
            var models = this.gr.test_run_definition.models;
            var testSetId = this.gr.test_run_definition.test_set;
            var testSet = new NLUBatchTestSet(testSetId);
            var utterances = testSet.getUtterances(models, true);
            if (!utterances || utterances.length === 0)
                throw new Error(gs.getMessage('Cannot run batch test against test set having 0 utterances'));
            return utterances;
        },

        _getPayload: function(modelNamesStr) {
            var payload = JSON.parse(JSON.stringify({
                utterances: this._getUtterances()
            }));
            if (!this.isOptimize()) {
                payload.maxTests = gs.getProperty(sysProps.UTTERANCE_LIMIT) || constants.MAX_TESTS;
                payload.modelNames = JSON.parse(modelNamesStr);
                payload.stepSize = payload.modelNames.length > 3 ? 0.05 : 0.01;
            }
            return payload;
        },

        _updateSolution: function(trainResult) {
            var mlGr = NLUMLSolutionUtil.getMlGr(trainResult.solutionName, trainResult.solutionVersion);
            if (gs.nil(mlGr))
                throw new Error(gs.getMessage('Solution record not found for {0}', JSON.stringify(trainResult)));

            var solutionId = mlGr.getUniqueValue();
            this.gr.setValue(FIELDS.SOLUTION, solutionId);
            this.gr.setValue(FIELDS.STATUS, EXECUTION_STATUS.INPROGRESS); // Train in progress
            if (!this.gr.update())
                throw new Error(gs.getMessage('Failed to update model data in test execution: {0}', this.executionId));
        },

        _cleanUpTestResults: function() {
            var testResult = new GlideRecord(tables.NLU_BATCH_TEST_RESULT);
            testResult.addQuery('test_run_execution', this.executionId);
            testResult.query();
            testResult.deleteMultiple();
        },

        // Updates NLU Model's confidence_threshold and also triggers train: 
        _updateModelThreshold: function() {
            try {
                var modelsData = this.gr.getValue(FIELDS.MODELS_DATA);
                var failedModelIds = [];
                JSON.parse(modelsData || '[]').forEach(function(model) {
                    var recommendedCt = model.recommended && model.recommended.confidence_threshold;
                    var currentCt = model.current && model.current.confidence_threshold;
                    if (recommendedCt && recommendedCt != currentCt) {
                        // update only if given model has recommendation availabale
                        var modelId = model.id;
                        var modelGr = global.NLUModel.getGRById(modelId);
                        if (modelGr) {
                            modelGr.setValue('confidence_threshold', recommendedCt);
                            if (modelGr.update()) {
                                // Trigger model training
                                var trainingResult = global.NLUStudioTrainer.trainModel(modelId);
                                if (trainingResult && trainingResult.status !== 'failure')
                                    return;
                            }
                        }
                        failedModelIds.push(modelId);
                    }
                });
                if (failedModelIds.length > 0) {
                    return this._errorResult(gs.getMessage('Failed to update model threshold for {0}', failedModelIds.join(', ')));
                }
                return {
                    status: 'success',
                    message: gs.getMessage('Model threshold updated')
                };
            } catch (e) {
                return this._errorResult(e.message);
            }
        },


        _errorResult: function(message) {
            gs.error('NLU Batch Test execution: ' + this.executionId + ' > Error: ' + message);
            return {
                status: 'failure',
                message: message
            };
        },
        getResultCount: function(outcome, predictionType) {
            var agg = new GlideAggregate(tables.NLU_BATCH_TEST_RESULT);
            agg.addAggregate('COUNT');
            agg.addEncodedQuery('test_run_execution=' + this.executionId + '^outcome=' + GlideStringUtil.escapeQueryTermSeparator(outcome) + '^prediction_type=' + GlideStringUtil.escapeQueryTermSeparator(predictionType), true);
            agg.query();
            return agg.next() ? parseInt(agg.getAggregate('COUNT')) : 0;
        },

        getTestRunData: function() {
            var data = {};
            var currentPredictionType = 'current';
            try {
                this.getGR();
                currentPredictionType = this.gr.getValue(FIELDS.SELECTED_TYPE);
            } catch (e) {
                return this._errorResult(e.message);
            }

            var newPredictionType = 'recommended';

            if (!currentPredictionType) {
                currentPredictionType = 'current';
            }
            if (this.isOptimize()) {
                newPredictionType = 'optimized';
            }

            data = {
                currentCorrect: this.getResultCount('correct', currentPredictionType),
                currentCorrectAmongMultiple: this.getResultCount('correct_among_multiple', currentPredictionType),
                currentIncorrect: this.getResultCount('incorrect', currentPredictionType),
                currentSkipped: this.getResultCount('incorrectly_skipped', currentPredictionType),
                recommendedCorrect: this.getResultCount('correct', newPredictionType),
                recommendedCorrectAmongMultiple: this.getResultCount('correct_among_multiple', newPredictionType),
                recommendedIncorrect: this.getResultCount('incorrect', newPredictionType),
                recommendedSkipped: this.getResultCount('incorrectly_skipped', newPredictionType)
            };
            return data;
        },

        type: 'NLUBatchTestExecution'
    };

})();

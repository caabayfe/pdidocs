var NLUBatchTestResultsProcessor = Class.create();

(function() {
    var tables = NLUWorkbenchConstants.tables;
    var constants = NLUWorkbenchConstants.constants;
    var EXECUTION_STATUS = NLUWorkbenchConstants.EXECUTION_STATUS;
    var RESULT_TYPE = NLUWorkbenchConstants.BATCHTEST_RESULT_TYPE;

    // This gets called from ml_solution record update BR: 
    NLUBatchTestResultsProcessor.processInBackground = function(execId) {
        gs.info('Triggering Batch test process results for execution: ' + execId);

        var script = "var processor = new sn_nlu_workbench.NLUBatchTestResultsProcessor('" + execId + "');";
        script += "var result = processor.start();";
        script += "gs.info('NLUBatchTestResultsProcessor.start result: ' + JSON.stringify(result));";
        global.NLUWorkbenchGlobalScript.scheduleScript(script);
    };

    NLUBatchTestResultsProcessor.prototype = {

        initialize: function(executionId) {
            this.executionId = executionId;
            this.testExecution = new NLUBatchTestExecution(this.executionId);
            this.testResults = new NLUBatchTestResults(this.testExecution);
        },

        /*
        Processes an execution result and does following: 
        - Add nlu_batch_test_result entry for current & recommendation / optimize types 
        - update the modelSnapshot in the execution record with aggregate counts.
        */
        start: function() {
            try {
                this.testResults.initDataMap();

                var results = this._getExecutionResults();
                this._processTestResults(results.testing, RESULT_TYPE.CURRENT);
                if (this._processSummaryResults(results.summary)) {
                    this._processTestResults(results.testing, RESULT_TYPE.RECOMMENDED);
                } else if (this.testExecution.isOptimize() && results.optimzed) {
                    this._updateModelThreshold(results.optimizedThreshold, RESULT_TYPE.OPTIMIZED);
                    this._processTestResults(results.optimzed, RESULT_TYPE.OPTIMIZED);
                }

                this.testResults.updateSnapshot(true);

                return {
                    status: 'success',
                    message: gs.getMessage('BatchTestResults processed successfully.')
                };
            } catch (e) {
                this.testExecution.updateStatus(EXECUTION_STATUS.FAILED);
                return this._errorResult(e.message);
            }
        },

        _getExecutionResults: function() {
            var solutionName = this.testExecution.getSolutionName();
            var solutionVersion = this.testExecution.getSolutionVersion();
            return NLUBatchTestIntegrator.getTestRunResults(solutionName, solutionVersion);
        },

        _processTestResults: function(testingResults, type) {
            if (testingResults && testingResults.status === 'success') {
                // Inferences will contain predicted intents and models info: 
                var inferences = testingResults.response && testingResults.response.inferences;
                if (!inferences || inferences.length === 0) throw new Error(gs.getMessage('No inferences found!'));

                var context = this;
                inferences.forEach(function(predictionData) {
                    context.testResults.addResult(predictionData, type);
                });
            } else {
                throw new Error(gs.getMessage('Failed to retrieve batch test execution results'));
            }
        },

        _processSummaryResults: function(summaryResults) {
            var context = this;
            var recommendedThreshold = null;
            if (summaryResults && summaryResults.status === 'success' && summaryResults.response) {
                recommendedThreshold = summaryResults.response && summaryResults.response.balanced && summaryResults.response.balanced.optimalThreshold;
                var readOnlyModels = context._getReadOnlyModels();

                var overridenThresholdCount = 0;
                Object.keys(recommendedThreshold || {}).forEach(function(modelName) {
                    var threshold = modelName && recommendedThreshold[modelName];
                    if (threshold === 100 || readOnlyModels.indexOf(modelName) !== -1) {
                        ++overridenThresholdCount;
                        recommendedThreshold[modelName] = context.testResults.getConfidenceThreshold(modelName, RESULT_TYPE.CURRENT);
                    }
                });
                if (Object.keys(recommendedThreshold || {}).length === overridenThresholdCount) {
                    recommendedThreshold = null; // all threshold were 100% or for readOnly models then it's equivalent to no threshold
                }
            }

            if (recommendedThreshold) {
                this._updateModelThreshold(recommendedThreshold, RESULT_TYPE.RECOMMENDED);
                return true;
            }
            return false;
        },

        _getReadOnlyModels: function() {
            var modelSnapshot = JSON.parse(this.testExecution.getGR().getValue('models_data'));
            var readOnlyModels = [];
            modelSnapshot && modelSnapshot.forEach(function(model) {
                if (model.sys_policy === 'read')
                    readOnlyModels.push(model.name);
            });
            return readOnlyModels;
        },

        _updateModelThreshold: function(ctMap, type) {
            for (var modelName in ctMap) {
                var modelCt = ctMap[modelName];
                if (!modelCt && type !== RESULT_TYPE.CURRENT)
                    modelCt = this.testResults.getConfidenceThreshold(modelName, RESULT_TYPE.CURRENT);
                this.testResults.addConfidenceThreshold(modelName, type, modelCt);
            }
        },

        _errorResult: function(message) {
            gs.error('NLU Batch Test Result processing: ' + this.executionId + ' > Error: ' + message);
            return {
                status: 'failure',
                message: message
            };
        },
        type: 'NLUBatchTestResultsProcessor'
    };
})();

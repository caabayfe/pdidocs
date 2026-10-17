var NLUBatchTestDefinition = Class.create();

(function() {

    var tables = NLUWorkbenchConstants.tables;
    var constants = NLUWorkbenchConstants.constants;
    var sysProps = NLUWorkbenchConstants.sysProps;
    var EXECUTION_STATUS = NLUWorkbenchConstants.EXECUTION_STATUS;
    var FIELDS = {
        TEST_SET: 'test_set',
        MODELS: 'models',
        IS_OPTIMIZE: 'optimize'
    };

    function isOptimizeSupported(modelSnapshot) {
        var language = modelSnapshot.language || constants.DEFAULT_LANGUAGE;
        var modelVersion = modelSnapshot.version;
        var response = {
            status: 'success'
        };
        var supportInfo = NLUBatchTestIntegrator.getOptimizeSupportedLanguages();
        if (supportInfo.status === 'success') {
            var optimizeSupportMap = supportInfo.optimizeSupportMap;
            if (optimizeSupportMap[language]) {
                if (optimizeSupportMap[language].nonSupportedVersions.indexOf(modelVersion) > -1) {
                    response.status = 'failure';
                    response.message = gs.getMessage('The model needs to be retrained with the latest NLU Service version before using this feature. Please retrain before running this analysis.');
                }
            } else {
                var supportedLangLabels = Object.keys(optimizeSupportMap).map(function(lang) {
                    return optimizeSupportMap[lang].label;
                }).join(', ');
                response.status = 'failure';
                response.message = gs.getMessage("The language of the selected model isn't supported by Optimize, please choose a model whose language is/one of {0}", supportedLangLabels);
            }
        } else {
            response.status = 'failure';
            response.message = gs.getMessage('Error while fetching optimization support for model: {0} ({1})', [modelVersion, language]);
        }
        return response;
    }

    /*
	Validations: 
		- Atleast one model
		- If optimize, model size == 1 
		- All the models should be:
			- of same version
			- of same language
    */
    NLUBatchTestDefinition.modelSnapshot = null; // This will be null for every REST call.
    NLUBatchTestDefinition.validateAndGetModelSnapshot = function(modelIds, isOptimize) {
        if (modelIds.length === 0) throw new Error(gs.getMessage('Model list is empty'));
        if (isOptimize && modelIds.length > 1) {
            throw new Error(gs.getMessage('Optimisation cannot be run on more than one model'));
        }

        var modelVersion = null,
            modelLanguage = null;
        NLUBatchTestDefinition.modelSnapshot = [];
        modelIds && modelIds.forEach(function(modelId) {
            var snapshot = NLUMLSolutionUtil.getModelSolutionInfo(modelId);
            if (isOptimize) {
                var response = isOptimizeSupported(snapshot);
                if (response.status === 'failure')
                    throw new Error(response.message);
            }

            if (!modelVersion) modelVersion = snapshot.version;
            if (!modelLanguage) modelLanguage = snapshot.language;

            if (modelVersion !== snapshot.version)
                throw new Error(gs.getMessage('Models must be of same version. Please re-train models for latest version.'));
            if (modelLanguage !== snapshot.language)
                throw new Error(gs.getMessage('Models must be of same language.'));

            NLUBatchTestDefinition.modelSnapshot.push(snapshot);
        });
        return NLUBatchTestDefinition.modelSnapshot;
    };

    NLUBatchTestDefinition.addRecord = function(testSetId, modelIds, isOptimize) {
        var record = new GlideRecord(tables.NLU_BATCH_TEST_RUN_DEFINITION);
        record.initialize();
        record.setValue(FIELDS.TEST_SET, testSetId);
        record.setValue(FIELDS.MODELS, modelIds);
        record.setValue(FIELDS.IS_OPTIMIZE, !!isOptimize);
        return record.insert();
    };

    NLUBatchTestDefinition.getRecord = function(testSetId, modelIds, isOptimize) {
        var record = new GlideRecord(tables.NLU_BATCH_TEST_RUN_DEFINITION);
        record.addQuery(FIELDS.TEST_SET, testSetId);
        record.addQuery(FIELDS.MODELS, modelIds);
        record.addQuery(FIELDS.IS_OPTIMIZE, !!isOptimize);
        record.orderByDesc('sys_updated_on');
        record.setLimit(1);
        record.query();
        return record.next() && record;
    };

    NLUBatchTestDefinition.runTestInBackground = function(definitionId, sync) {
        try {
            var testDefinition = new NLUBatchTestDefinition(definitionId);
            if (testDefinition.isExecutionInProgress())
                throw new Error(gs.getMessage('Already an execution is running for this test definition'));

            var modelSnapshot = testDefinition.getModelSnapshot();
            var testSetSnapshot = testDefinition.getTestSetSnapshot();
            var executionId = NLUBatchTestExecution.addRecord(definitionId, modelSnapshot, testSetSnapshot);
            if (!gs.nil(executionId)) testDefinition.purgeExecutions();

            if (!sync) {
                var script = "var result = new sn_nlu_workbench.NLUBatchTestExecution('" + executionId + "').start();";
                script += "gs.info('NLUBatchTestExecution.start result: ' + JSON.stringify(result));";
                global.NLUWorkbenchGlobalScript.scheduleScript(script, tables.NLU_BATCH_TEST_RUN_EXECUTION, executionId);
                return {
                    status: 'success',
                    definitionId: definitionId,
                    executionId: executionId
                };
            } else {
                return new sn_nlu_workbench.NLUBatchTestExecution(executionId).start();
            }
        } catch (e) {
            return {
                status: 'failure',
                message: e.message
            };
        }
    };

    NLUBatchTestDefinition.prototype = {

        initialize: function(definitionId) {
            this.definitionId = definitionId;
        },

        getGR: function() {
            if (!gs.nil(this.gr)) return this.gr;
            this.gr = new GlideRecord(tables.NLU_BATCH_TEST_RUN_DEFINITION);
            if (this.gr.get(this.definitionId))
                return this.gr;
            else
                throw new Error(gs.getMessage('Invalid batch test definition'));
        },

        isExecutionInProgress: function() {
            this.getGR();

            // Check if there is already a test run is in progress:
            var inProgressStatuses = EXECUTION_STATUS.PREPARING + EXECUTION_STATUS.INPROGRESS;
            var executionGr = this.getExecutionGr('statusIN' + inProgressStatuses, 1);
            return executionGr.next() && executionGr;
        },

        getModelSnapshot: function() {
            if (NLUBatchTestDefinition.modelSnapshot)
                return NLUBatchTestDefinition.modelSnapshot;

            var modelIdsStr = this.getGR().getValue(FIELDS.MODELS);
            var modelIds = modelIdsStr ? modelIdsStr.split(',') : [];
            var isOptimize = this.getGR().getValue(FIELDS.IS_OPTIMIZE);
            return NLUBatchTestDefinition.validateAndGetModelSnapshot(modelIds, (isOptimize != 0 && !!isOptimize));
        },

        getTestSetSnapshot: function() {
            var testSet = new NLUBatchTestSet(this.getGR().test_set);
            return {
                last_updated_on: testSet.getLastUpdatedOn(),
                records_count: testSet.getUtteranceCount()
            };
        },

        getExecutionGr: function(filter, limit) {
            var executionGr = new GlideRecord(tables.NLU_BATCH_TEST_RUN_EXECUTION);
            executionGr.addQuery('test_run_definition', this.definitionId);
            if (filter) executionGr.addEncodedQuery(filter);
            executionGr.orderByDesc('sys_updated_on');
            if (limit) executionGr.setLimit(limit);
            executionGr.query();
            return executionGr;
        },

        purgeExecutions: function() {
            var maxRuns = parseInt(gs.getProperty(sysProps.MAX_BATCH_TEST_RUNS, constants.DEFAULT_MAX_RUNS));
            if (maxRuns < 0) return; // if value is 0 / -ve, then do not purge.

            var executionGr = this.getExecutionGr();
            var count = 1;
            while (executionGr.next()) {
                if (count > maxRuns) {
                    gs.info('Purging Batch Test execution: ' + executionGr.getUniqueValue());
                    executionGr.deleteRecord();
                }
                count++;
            }
        },

        type: 'NLUBatchTestDefinition'
    };

})();
